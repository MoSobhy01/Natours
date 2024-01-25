const mongoose = require('mongoose');
const slugify = require('slugify');

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'Point',
    enum: ['Point'],
    message: 'Start location must be a point',
  },
  coordinates: [Number],
  address: String,
  description: String,
  day: Number,
});

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a name'],
      unique: [true, 'A tour must have a unique name'],
      minLength: [10, 'A "name" must be more than or equal to 10 characters'],
      maxLength: [40, 'A "name" must be less than or equal to 40 characters'],
      match: /^[a-zA-Z ]*$/,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],
    },
    difficulty: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'A tour must have a difficulty levels ONLY (easy, medium, difficult)',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'A rating Average must be greater than 1'],
      max: [5, 'A rating Average must be less than or equal to 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message:
          'A tour must have a price discount less than the original price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a image'],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: {
      type: [Date],
    },
    startLocation: pointSchema,
    locations: [pointSchema],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
);

//indexes
tourSchema.index({ slug: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ startLocation: '2dsphere' });

//Virtual Properties (derived from other properties)
tourSchema.virtual('durationWeeks').get(function () {
  if (this.duration) return this.duration / 7;
});
//Document Middleware (pre 'save')
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//Query Middleware
tourSchema.pre(/^find/, function (next) {
  //checks whether the guides property is selected in projection or not
  if (this.selectedInclusively())
    if (!this._userProvidedFields.guides) return next();

  if (this.selectedExclusively())
    if (this._userProvidedFields.guides === 0) return next();

  this.populate({
    path: 'guides',
    select: '-__v -lastPasswordChange',
  });
  next();
});
tourSchema.pre('findOne', function (next) {
  this.populate('reviews');
  next();
});

//Aggregate Middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secret: { $ne: true } } });
//   next();
// });

const Tour = new mongoose.model('Tour', tourSchema);

module.exports = Tour;

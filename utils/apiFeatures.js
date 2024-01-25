module.exports = class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // to prevent parameter pollution
  static formatQuery(query) {
    if (Array.isArray(query)) {
      query = query.join(' ');
    } else query = query.replaceAll(',', ' ');
    return query;
  }

  filter() {
    const { ...queryObj } = this.queryString;
    let queryStr = JSON.stringify(queryObj);
    // //<, <=, >, >=
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const criteria = APIFeatures.formatQuery(this.queryString.sort);
      this.query = this.query.sort(`${criteria} _id`);
    } else this.query = this.query.sort('-createdAt _id');

    return this;
  }

  projection() {
    if (this.queryString.fields) {
      const required = APIFeatures.formatQuery(this.queryString.fields);
      this.query = this.query.select(required);
    } else this.query = this.query.select('-__v');

    return this;
  }

  paginate() {
    let { limit, page } = this.queryString;
    limit = limit * 1 || 50;
    page = (page * 1 || 1) > 0 ? page * 1 : 1;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
};

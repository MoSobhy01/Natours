const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      throw new AppError('No Document is found!🥲', 404);
    }
    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc) {
      throw new AppError('No Document was found!🥲', 404);
    }
    res.status(200).json({
      status: 'Success',
      data: {
        data: updatedDoc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        data: newDoc,
      },
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      throw new AppError('No document was found!🥲', 404);
    }

    res.status(200).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    const filterObj = {};
    if (req.params.tourId) filterObj.tour = req.params.tourId;
    const features = new APIFeatures(Model.find(filterObj), req.query);
    //Building Query
    features.filter().sort().projection().paginate();

    //Execute Query
    const docs = await features.query; //.explain();

    //Response
    res.status(200).json({
      status: 'Success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });

exports.deleteOneIfOwner = (Model, ownerField) =>
  catchAsync(async (req, res) => {
    const filterOpt = {
      _id: req.params.id,
    };
    if (req.user.role !== 'admin') filterOpt[ownerField] = req.user.id;
    const doc = await Model.findOneAndDelete(filterOpt);

    if (!doc) {
      throw new AppError('No Document is found! / Forbidden', 404);
    }
    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });

exports.updateOneIfOwner = (Model, ownerField) =>
  catchAsync(async (req, res) => {
    const filterOpt = {
      _id: req.params.id,
    };
    if (ownerField) filterOpt[ownerField] = req.user.id;

    const doc = await Model.findOneAndUpdate(filterOpt, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      throw new AppError('No Document is found! / Forbidden', 404);
    }
    res.status(200).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  });

const Lead = require('../models/Lead');

const getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    if (limit > 100) {
      return res.status(400).json({ message: 'Limit cannot exceed 100' });
    }
    
    const filter = { user: req.user._id };
    
    if (req.query.email) {
      filter.email = { $regex: req.query.email, $options: 'i' };
    }
    
    if (req.query.company) {
      filter.company = { $regex: req.query.company, $options: 'i' };
    }
    
    if (req.query.city) {
      filter.city = { $regex: req.query.city, $options: 'i' };
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.source) {
      filter.source = req.query.source;
    }
    
    if (req.query.is_qualified !== undefined) {
      filter.is_qualified = req.query.is_qualified === 'true';
    }
    
    if (req.query.score_min || req.query.score_max) {
      filter.score = {};
      if (req.query.score_min) filter.score.$gte = parseInt(req.query.score_min);
      if (req.query.score_max) filter.score.$lte = parseInt(req.query.score_max);
    }
    
    if (req.query.lead_value_min || req.query.lead_value_max) {
      filter.lead_value = {};
      if (req.query.lead_value_min) filter.lead_value.$gte = parseFloat(req.query.lead_value_min);
      if (req.query.lead_value_max) filter.lead_value.$lte = parseFloat(req.query.lead_value_max);
    }
    
    if (req.query.created_after || req.query.created_before) {
      filter.createdAt = {};
      if (req.query.created_after) filter.createdAt.$gte = new Date(req.query.created_after);
      if (req.query.created_before) filter.createdAt.$lte = new Date(req.query.created_before);
    }

    const total = await Lead.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: leads,
      page,
      limit,
      total,
      totalPages
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error while fetching leads' });
  }
};

const getLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid lead ID format' });
    }
    
    res.status(500).json({ message: 'Server error while fetching lead' });
  }
};

const createLead = async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ message: 'First name, last name, and email are required' });
    }

    const leadData = {
      ...req.body,
      user: req.user._id
    };

    const lead = await Lead.create(leadData);
    res.status(201).json(lead);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists for this user' });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Server error while creating lead' });
  }
};

const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json(lead);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists for this user' });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid lead ID format' });
    }
    
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Server error while updating lead' });
  }
};

const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.status(200).json({ message: 'Lead deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid lead ID format' });
    }
    
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Server error while deleting lead' });
  }
};

module.exports = {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead
};
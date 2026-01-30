const ConditionResult = require('../models/conditionResult');

exports.predictCondition = async (req, res) => {
  try {
    const {
      current_tumor_size,
      previous_tumor_size,
      current_nodes_positive,
      previous_nodes_positive
    } = req.body;

    const userId = req.headers['x-user-id'] || (req.session.user && req.session.user.userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    // Predict condition result
    let result = 'Stable';

    if (
      current_tumor_size < previous_tumor_size &&
      current_nodes_positive < previous_nodes_positive
    ) {
      result = 'Improved';
    } else if (
      current_tumor_size > previous_tumor_size ||
      current_nodes_positive > previous_nodes_positive
    ) {
      result = 'Worsened';
    }

    // Save to DB
    const newResult = new ConditionResult({
      user: userId,
      current_tumor_size,
      previous_tumor_size,
      current_nodes_positive,
      previous_nodes_positive,
      result
    });

    await newResult.save();

    res.json({
      data: { result },
      message: `Your condition has ${result.toLowerCase()}`
    });

  } catch (error) {
    console.error("Error in predictCondition:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getConditionHistory = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || (req.session.user && req.session.user.userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    const results = await ConditionResult
      .find({ user: userId })
      .sort({ checkedAt: -1 });

    res.json({ results });

  } catch (error) {
    console.error("Error in getConditionHistory:", error);
    res.status(500).json({ error: "Server error" });
  }
};

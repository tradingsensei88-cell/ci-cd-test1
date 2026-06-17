import { categoryService } from '../services/dbService.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.findAll();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Create category (Admin only)
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !description) {
      res.status(400);
      throw new Error('Please enter name and description');
    }

    const exists = await categoryService.findByName(name);
    if (exists) {
      res.status(400);
      throw new Error('Category already exists');
    }

    const category = await categoryService.create({ name, description, image });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const success = await categoryService.delete(req.params.id);
    if (success) {
      res.json({ message: 'Category removed' });
    } else {
      res.status(404);
      throw new Error('Category not found');
    }
  } catch (error) {
    next(error);
  }
};

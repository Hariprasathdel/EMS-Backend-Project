const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
} = require('../controllers/projectController');

router.use(protect);

// @route   GET /api/projects
// @desc    List projects (filter by status, search, paginate)
// @access  All authenticated
router.get('/', getProjects);

// @route   GET /api/projects/:id
// @desc    Get one project
// @access  All authenticated
router.get('/:id', getProject);

// @route   POST /api/projects
// @desc    Create project
// @access  Admin, Manager
router.post('/', authorize('admin', 'manager'), createProject);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Admin, Manager
router.put('/:id', authorize('admin', 'manager'), updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Admin only
router.delete('/:id', authorize('admin'), deleteProject);

// @route   POST /api/projects/:id/team
// @desc    Add employee to project team
// @access  Admin, Manager
router.post('/:id/team', authorize('admin', 'manager'), addTeamMember);

// @route   DELETE /api/projects/:id/team/:employeeId
// @desc    Remove employee from team
// @access  Admin, Manager
router.delete('/:id/team/:employeeId', authorize('admin', 'manager'), removeTeamMember);

module.exports = router;

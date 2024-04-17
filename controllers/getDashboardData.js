const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const getDashboardData = async (req, res, next) => {
    try {
        // Fetch user count
        const usersCount = await User.countDocuments();

        // Fetch active users count
        const activeUsersCount = await User.countDocuments({ act: true });

        // Fetch recent activities (e.g., the 10 most recent)
        const recentActivities = await ActivityLog.find()
            .sort({ timestamp: -1 }) // Sort by latest activities
            .limit(10) // Limit to the 10 most recent activities
            .exec();

        // Fetch user role breakdown
        const userRolesBreakdown = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
        ]);

        // Construct response data
        const dashboardData = {
            usersCount,
            activeUsersCount,
            recentActivities,
            userRolesBreakdown,
        };

        // Render the EJS template and pass data to it
        res.render('dashboard', { data: dashboardData });
    } catch (error) {
        console.error('Error fetching data for admin dashboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getDashboardData = getDashboardData;

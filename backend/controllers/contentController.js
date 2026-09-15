exports.getLandingContent = (req, res) => {
    // In a real app, fetch from DB
    res.status(200).json({
        success: true,
        data: {
            hero: {
                title: "Institutional Trading Intelligence",
                subtitle: "Unlocking Hedge Fund Level Analytics for Everyone"
            },
            pricing: {
                basic: 99,
                pro: 199
            }
        }
    });
};

exports.updateLandingContent = (req, res) => {
    // In a real app, update DB
    // req.body contains new content
    console.log('Admin updating content:', req.body);

    res.status(200).json({
        success: true,
        data: req.body,
        message: 'Content updated successfully'
    });
};

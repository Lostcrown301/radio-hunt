export function debugAuth(req, res, next) {
    const expectedDebugKey = process.env.DEBUG_API_KEY;
    const providedDebugKey = req.get("x-debug-key");

    if (!expectedDebugKey || providedDebugKey !== expectedDebugKey) {
        return res.status(403).json({
            error: "Forbidden",
        });
    }

    return next();
}

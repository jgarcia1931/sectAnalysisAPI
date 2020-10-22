const asyncHandlerPass = fn => (accessToken, refreshToken, profile, done) =>
    Promise.resolve(fn(accessToken, refreshToken, profile, done))

module.exports = asyncHandlerPass;
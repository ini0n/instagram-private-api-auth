var util = require('util')

function IncorrectChallengeTypeError(message, json) {
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.message = message
    this.json = json
}
util.inherits(IncorrectChallengeTypeError, Error)
exports.IncorrectChallengeTypeError = IncorrectChallengeTypeError

function CheckpointEndlessLoopError(message, json) {
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.message = message
    this.json = json
}
util.inherits(CheckpointEndlessLoopError, Error)
exports.CheckpointEndlessLoopError = CheckpointEndlessLoopError
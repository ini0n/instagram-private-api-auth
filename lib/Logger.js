const colorista = require('colorista')
const util = require('util')

let Logger = function(_parent, options) {
    let parent = _parent.split('\\').slice(-1)[0]
    let textMessage = ''
    let config = {
        info: { active: false, color: 'cyan' },
        warn: { active: false, color: 'yellow'},
        error: { active: false, color: 'red'},
        debug: { active: false, color: 'white'}
    }

    let _getFormatText = (level, message) => {
        let dateString = new Date().toISOString().replace('T', ' ').replace('Z', '')
        if (typeof message === 'object') {
            textMessage = '\n'+JSON.stringify(message, null, 3)
        } else {
            textMessage = message
        }
        
        let textStatus = `${'['+level.toUpperCase()+']'}`
        return colorista`${''+dateString+''} ${textStatus.padEnd(8)}${parent}:  ${textMessage}`([
            { fg: `bright magenta`, modifiers: ['b'] },
            { fg: `${config[level].color}`, modifiers: ['b'] },
            { fg: 'green', modifiers: ['b'] },
            { fg: `${_getMessageTextColor(level)}`, modifiers: ['b'] }
        ])
    }

    let _getMessageTextColor = (level) => {
        if (['error', 'warn'].includes(level)) {
            return config[level].color
        }
    }

    return (() => {
        let logLevels = {}
        
        Object.keys(config).forEach(el => {
            Object.assign(logLevels, {
                [`${el}`]: (message) => {
                    if (options.indexOf(el) !== -1)
                        console.log(_getFormatText(el, message))
                }
            })
        })

        return logLevels
    })()
}

module.exports = Logger
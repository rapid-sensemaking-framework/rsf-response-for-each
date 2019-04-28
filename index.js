const { readInput, writeOutput } = require('rsf-reader-writer')
const { makeContactable } = require('rsf-contactable')

const INVALID_RESPONSE_TEXT = `That's not a valid response, please try again.`
const MAX_RESPONSES_TEXT = `You've responded to everything. Thanks for participating. You will be notified when everyone has completed.`
const ALL_COMPLETED_TEXT = `Everyone has completed. Thanks for participating.`
const TIMEOUT_TEXT = `The max time has been reached. Stopping now. Thanks for participating.`
const rulesText = (maxTime) => `The process will stop automatically after ${maxTime} milliseconds.` // TODO: improve the human readable time
const giveOptionsText = (options) => {
    return `The options for each statement are: ${options.map(o => `${o.text} (${o.triggers.join(', ')})`).join(', ')}`
}

// use of this trigger will allow any response to match
const WILDCARD_TRIGGER = '*'


// needs
// options : [Option], the available response options
// Option.text : String, the human readable meaning of this response, such as 'Agree'
// Options.triggers : [String], valid strings that will represent the selection of this option, such as `['a', 'A', 'agree']`, '*' will match any response
// statements : [Statement], the statements to collect responses to. `Statement` is an object because it could optionally have an `id` property signifying the person who authored it
// Statement.text : String, the text of this statement to give to partipants for responding to.
// maxTime : Number, the number of milliseconds to wait until stopping this process automatically
// contactables: [Contactable], the "contactables" array from `rsf-contactable`, or a mock... objects with `.speak` and `.listen` methods.
// callback : Function, a callback to call with only one argument which are the results

// gives
// results : [Response], array of the responses collected
// Response.statement : Statement, the same as the Statement objects given
// Response.response : String, the text of the response
// Response.id : String, the id of the agent who gave the response
// Response.timestamp : Number, the unix timestamp of the moment the message was received
const rsfResponseForEach = (options, statements, maxTime, contactables, callback) => {
    // array to store the results
    const results = []

    // stop the process after a maximum amount of time
    const timeoutId = setTimeout(() => {
        // complete, saving whatever results we have
        complete(TIMEOUT_TEXT)
    }, maxTime)

    // setup a completion handler that
    // can only fire once
    let calledComplete = false
    const complete = (completionText) => {
        if (!calledComplete) {
            contactables.forEach(contactable => contactable.speak(completionText))
            clearTimeout(timeoutId)
            callback(results)
            calledComplete = true
        }
    }

    // a function to check the validity of a response
    // according to the options
    const validResponse = (text) => {
        return options.find(option => {
            return option.triggers.find(trigger => trigger === text || trigger === WILDCARD_TRIGGER)
        })
    }

    // a function to check the completion conditions
    const checkCompletionCondition = () => {
        // exit when everyone has responded to everything
        if (results.length === contactables.length * statements.length) {
            complete(ALL_COMPLETED_TEXT)
        }
    }

    contactables.forEach(contactable => {

        // initiate contact with the person
        // and set context, and "rules"
        // contactable.speak(prompt)
        contactable.speak(rulesText(maxTime))
        contactable.speak(giveOptionsText(options))

        // send them one message per statement,
        // awaiting their response before sending the next
        let responseCount = 0
        const nextText = () => {
            return `(${statements.length - 1 - responseCount} remaining) ${statements[responseCount].text}`
        }
        contactable.listen(text => {

            // do we still accept this response?
            if (responseCount < statements.length) {
                if (!validResponse(text)) {
                    contactable.speak(INVALID_RESPONSE_TEXT)
                    return
                }
                results.push({
                    statement: statements[responseCount],
                    response: text,
                    id: contactable.id,
                    timestamp: Date.now()
                })
                responseCount++
            }

            // is there anything else we should say?
            if (responseCount === statements.length) {
                // remind them they've responded to everything
                contactable.speak(MAX_RESPONSES_TEXT)
            } else {
                // still haven't reached the end,
                // so send the next one
                contactable.speak(nextText())
            }

            // are we done?
            checkCompletionCondition()
        })
        // send the first one
        contactable.speak(nextText())
    })
}
module.exports.rsfResponseForEach = rsfResponseForEach


module.exports.main = (dir) => {
    const input = readInput(dir)

    const OPTIONS = input.options
    const STATEMENTS = input.statements
    const PARTICIPANTS_CONFIG = input.participants_config
    const MAX_TIME = input.max_time // TODO: set a default?

    // convert each config into a "contactable", with `speak` and `listen` functions
    const contactables = PARTICIPANTS_CONFIG.map(makeContactable)

    rsfResponseForEach(OPTIONS, STATEMENTS, MAX_TIME, contactables, results => {
        // this save the output to a file
        writeOutput(dir, results)
        // this exits the process with 'success' status
        // use exit code 1 to show error
        // allow any remaining messages to be sent
        setTimeout(() => {
            process.exit()
        }, 2000)
    })
}
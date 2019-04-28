# rsf-response-for-each

for a list/array of statements, collect a response or vote for each from a list of participants

## Installation
```
npm install --save rsf-response-for-each
```

## API

### `rsfResponseForEach(options, statements, maxTime, contactables, callback)`

The core logic for interacting with participants, timeouts, and collecting responses.

How it works:
- rules will be given to the participants
- options and how to use them will be given
- each participant will be sent each statement one by one, asking for a response, and only sending the next one once a valid response to the current one has been received
- each statement will also include how many remaining statements there are to respond to
- will complete will everyone has responded to everything, or the timeout `maxTime` comes to pass, in which case it will finish with whatever results have been given so far

`options` : `[Option]`, the available response options

`Option.text` : `String`, the human readable meaning of this response, such as 'Agree'

`Options.triggers` : `[String]`, valid strings that will represent the selection of this option, such as `['a', 'A', 'agree']`, `*` will match any response

`statements` : `[Statement]`, the statements to collect responses to. `Statement` is an object because it could optionally have an `id` property signifying the person who authored it

`Statement.text` : `String`, the text of this statement to give to partipants for responding to.

`maxTime` : `Number`, the number of milliseconds to wait until stopping this process automatically

`contactables`: `[Contactable]`, the "contactables" array from `rsf-contactable`, or a mock... objects with `.speak` and `.listen` methods.

`callback` : `Function`, a callback to call with only one argument which are the results

`callback -> results` : `[Response]`, array of the responses collected. If the process completed before the timeout, there should be as many as the number of participants in `contactables` times the number of `statements`.

`Response.statement` : `Statement`, the entirety of the statement this is a response to

`Response.response` : `String`, the text of the response

`Response.id` : `String`, the id of the agent who gave the response

`Response.timestamp` : `Number`, the unix timestamp of the moment the response message was received


### `main(readWriteDir)`

executes as a process until `rsfResponseForEach` completes, at which points it writes the results to a JSON file in the given `readWriteDir` directory, and exits the process.

`readWriteDir` : `String`, the path to the directory from which to read an `input.json` file and write the `output.json` file

Expectations for `input.json`:

`input.options`, for `options` in `rsfResponseForEach`

`input.statements` for `statements` in `rsfResponseForEach`

`input.participants_config` which it will make an `[Contactables]` using `makeContactable` from `rsf-contactable`  to pass in as `contactables` to `rsfResponseForEach`

`input.max_time`, for `maxTime` in `rsfResponseForEach`


## Development

Tests are written with mocha/chai/sinon and can be run with
```
npm test
```
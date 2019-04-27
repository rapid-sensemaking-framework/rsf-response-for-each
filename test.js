const { expect } = require('chai')
const sinon = require('sinon')
const { rsfResponseForEach } = require('./index')
const { newMockMakeContactable } = require('rsf-contactable')


describe('#rsfResponseForEach', () => {
    context('when timeout is reached, regardless if no responses have been added', function () {
        it('should early exit and return 0 results', done => {
            rsfResponseForEach([], [], 1000, [], results => {
                expect(results.length).to.equal(0)
                done()
            })
        })
    })

    context('when the number of participants is 2, and the process completes through user actions', function () {
        it('the number of responses should equal the number of participants times the number of statements', done => {
            const mockMakeContactable = newMockMakeContactable(sinon.spy)
            const contactables = [{ id: 'p1' }, { id: 'p2' }].map(mockMakeContactable)
            const statements = [
                {
                    text: 'great idea'
                },
                {
                    text: 'great idea 2'
                }
            ]
            const options = [
                {
                    text: 'Agree',
                    triggers: ['a']
                },
                {
                    text: 'Disagree',
                    triggers: ['d']
                }
            ]
            rsfResponseForEach(options, statements, 1000, contactables, results => {
                expect(results.length).to.equal(4)
                done()
            })
            contactables[0].trigger('a')
            contactables[0].trigger('a')
            contactables[1].trigger('d')
            contactables[1].trigger('d')
        })
    })

    // TODO: invalid responses

    // TODO: rules and context
})
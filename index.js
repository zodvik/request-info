const getComment = require('./lib/getComment')
const defaultConfig = require('./lib/defaultConfig')
const PullRequestBodyChecker = require('./lib/PullRequestBodyChecker')
const IssueBodyChecker = require('./lib/IssueBodyChecker')
const getConfig = require('probot-config')
const setStatus = require('./lib/setStatus')

module.exports = app => {
  app.on(['pull_request.opened', 'pull_request.edited', 'issues.opened'], receive)
  async function receive (context) {
    let title
    let body
    let badTitle
    let badBody
    let user

    let eventSrc = 'issue'
    if (context.payload.pull_request) {
      ({title, body, user} = context.payload.pull_request)
      eventSrc = 'pullRequest'
    } else {
      ({title, body, user} = context.payload.issue)
    }

    try {
      let config = await getConfig(context, 'config.yml')
      if (!config) {
        config = defaultConfig
      }

      if (!config.requestInfoOn[eventSrc]) {
        return
      }

      let message = ""
      if (config.requestInfoDefaultTitles && config.requestInfoDefaultTitles.includes(title.toLowerCase())) {
          badTitle = true
          message = "title contains default value"
      }

      if (title.length < config.minTitleLength) {
          badTitle = true
          message = "title should be descriptive"
      }

      if (body.length < config.minBodyLength) {
          badBody = true
          message = "body should be descriptive"
      }

      if (eventSrc === 'pullRequest') {
        if (config.checkPullRequestTemplate && !(await PullRequestBodyChecker.isBodyValid(body, context))) {
          badBody = true
          message = "body template should be filled"
        }
      } else if (eventSrc === 'issue') {
        if (config.checkIssueTemplate && !(await IssueBodyChecker.isBodyValid(body, context))) {
          badBody = true
          message = "issue template should be filled"
        }
      }

      let notExcludedUser = true
      if (config.requestInfoUserstoExclude) {
        if (config.requestInfoUserstoExclude.includes(user.login)) {
          notExcludedUser = false
          message = "whitelisted user"
        }
      }

      const invalidTitleBody = (!body || badTitle || badBody) && notExcludedUser
      if (invalidTitleBody && eventSrc === 'issue') {
        const comment = getComment(config.requestInfoReplyComment, defaultConfig.requestInfoReplyComment)
        context.github.issues.createComment(context.issue({body: comment}))
      } else if (eventSrc === 'pullRequest') {
        setStatus(context, invalidTitleBody, message)
      }
    } catch (err) {
      if (err.code !== 404) {
        throw err
      }
    }
  }

}

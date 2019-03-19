const defaultConfig = {
  requestInfoReplyComment: 'Please provide more info about this issue/pr!',
  requestInfoOn: {
    issue: true,
    pullRequest: true
  },
  checkIssueTemplate: true
  checkPullRequestTemplate: true
  minTitleLength: 10,
  minBodyLength: 20
}

module.exports = defaultConfig

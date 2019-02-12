function setStatus(context, invalidTitleBody, message) {
  const {github} = context;

  const status =
    !invalidTitleBody
      ? {
          state: 'success',
          description: message,
        }
      : {
          state: 'failure',
          description: message,
        };

  return github.repos.createStatus(
    context.repo({
      ...status,
      sha: context.payload.pull_request.head.sha,
      context: 'request-info',
    }),
  );
}

module.exports = setStatus

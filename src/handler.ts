import * as core from '@actions/core'
import {Context} from '@actions/github/lib/context'
import {GitHub} from '@actions/github/lib/utils'
import {PullRequest} from './github/pull_request'
import {Issue} from './github/issue'
import {Configuration} from './interfaces/configuration'
import {LabelWorker} from './workers/label_worker'

export async function handle(
  octokit: InstanceType<typeof GitHub>,
  context: Context,
  configuration: Configuration
): Promise<void> {
  if (context.issue.number === undefined) {
    return
  }
  const pr = new PullRequest(octokit, context)
  const issue = new Issue(octokit, context)

  const linkedIssueToPRNumber = await issue.getLinkedIssueToPrNumber()

  core.info(`Extracting linked issue from PR: ${linkedIssueToPRNumber?.toString() ?? 'not found'}`)

  if (!linkedIssueToPRNumber) {
    core.info('No issue number was found. Exiting.')
    return
  }

  const labelWroker = new LabelWorker(pr, issue, linkedIssueToPRNumber, configuration)
  await labelWroker.run()
}

export async function handleApprovals(
  octokit: InstanceType<typeof GitHub>,
  context: Context
): Promise<void> {
  const pr = new PullRequest(octokit, context)

  // get current approvals
  const approvals = await pr.getApprovals()

  if (approvals == 1) {
    core.info('add 1 label')
  } else if (approvals > 1) {
    core.info('add approved label')
  }
}

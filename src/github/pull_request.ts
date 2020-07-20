import {Context} from '@actions/github/lib/context'
import * as core from '@actions/core'
import {GitHub, context} from '@actions/github/lib/utils'

export class PullRequest {
  private octokit: InstanceType<typeof GitHub>
  private context: Context

  constructor(octokit: InstanceType<typeof GitHub>, context: Context) {
    this.octokit = octokit
    this.context = context
  }

  isMerged(): boolean {
    return this.context.payload.pull_request && this.context.payload.pull_request['merged']
  }

  async getApprovals(): Promise<number> {
    const {owner, repo} = this.context.repo

    const reviews = await this.octokit.pulls.listReviews({
      owner,
      repo,
      pull_number: context.issue.number
    })

    // eslint-disable-next-line @typescript-eslint/no-for-in-array
    for (const review in reviews.data) {
      core.info(review)
    }

    core.info(`Approvals count ${reviews.data.length}`)

    return reviews.data.length
  }
}

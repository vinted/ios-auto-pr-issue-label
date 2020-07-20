import {Context} from '@actions/github/lib/context'
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

    const approvals: number[] = []

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < reviews.data.length; i++) {
      const userId = reviews.data[i].user.id
      if (reviews.data[i].state.toLowerCase() == 'approved' && !approvals.includes(userId)) {
        approvals.push(userId)
      }
    }

    return approvals.length
  }
}

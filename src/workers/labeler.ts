import {Issue} from '../github/issue'

export class Labeler {
  private issue: Issue
  private issueNumber: number

  constructor(issue: Issue, issueNumber: number) {
    this.issue = issue
    this.issueNumber = issueNumber
  }

  async addLabelIfNeeded(label: string): Promise<void> {
    const containsLabel = await this.issue.containsGivenLabel(this.issueNumber, label)

    if (!containsLabel) {
      await this.issue.addLabel(this.issueNumber, label)
    }
  }

  async removeLabelIfNeeded(label: string): Promise<void> {
    const containsLabel = await this.issue.containsGivenLabel(this.issueNumber, label)

    if (containsLabel) {
      await this.issue.removeLabel(this.issueNumber, label)
    }
  }
}

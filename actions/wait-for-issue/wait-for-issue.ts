import * as core from '@actions/core';
import * as github from '@actions/github';


function wait(ms:number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
    try {
        const TOKEN = core.getInput('github-token');
        const octokit = github.getOctokit(TOKEN);
        const ISSUE_NUM = core.getInput('issue-number');
        const INTERVAL_WAIT_TIME = parseInt(core.getInput('interval-wait-time')) || 1000;
        const MAX_TRY = parseInt(core.getInput('max-try')) || 1;

        let trycnt = 1;
        let success = false;

        while (trycnt++ <= MAX_TRY) {
            core.info(`try read issue (${trycnt})`);

            const comments = await octokit.rest.issues.listComments({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: parseInt(ISSUE_NUM)
            })

            const userComment = comments.data.find((v) => v.user && v.user.type === "User");
            if (userComment) {
                success = true;
                core.setOutput('comment-body', userComment.body);
                break;
            }
            
            await wait(INTERVAL_WAIT_TIME);
        }

        if (!success) {
            core.setFailed('No response (time over)!');
        }
    } catch (error:any) {
        core.setFailed(error.message);
    }
}
run();
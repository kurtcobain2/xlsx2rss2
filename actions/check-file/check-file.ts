import * as core from '@actions/core';
import * as github from '@actions/github';
import moment from 'moment';

async function run() {
    try {
        const TOKEN = core.getInput('github-token');
        const octokit = github.getOctokit(TOKEN);

        let nowTime = Number(moment().utcOffset('+09:00').format('HHmmss'))
        
        octokit.rest.repos.getCommit({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            ref: github.context.sha
        }).then((res) => {
            // check file type
            if (
                nowTime > 80000 && nowTime < 190000 &&
                res.data.files?.length === 1 &&
                res.data.files[0].status === "added" &&
                /^files\/.+\.xlsx?$/.test(res.data.files[0].filename)
            ) {
                core.setOutput('success', 'true');
            } else {
                console.log(nowTime);
                console.log(res.data.files);
                throw new Error(`CHECK_FAIL`);
            }
        }).catch((err) => {
            console.log(err);
            throw new Error(err);
        })
    } catch (error:any) {
        core.setFailed(error);
    }
}
run()
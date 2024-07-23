// const http = require('http');
import core from '@actions/core';
import github from '@actions/github';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import axios from 'axios';


interface WebhookBody {
    repo: string;
    artifact_id: number;
    issue_num: string;
}

function wait(ms:number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
    try {
        const TOKEN = core.getInput('github-token');
        const octokit = github.getOctokit(TOKEN);
        const ARTIFACT_ID = core.getInput('artifact-id');
        const JWT_SECRET = core.getInput('jwt-secret');
        const ISSUE_NUM = core.getInput('issue-number');
        const API_URL = core.getInput('api-url');
        const TEMP_FOLDER_DATA = core.getInput('temp-folder-data');

        let timestamp = Date.now();
        let payload = {
            sha: github.context.sha,
            repository: github.context.repo.repo,
            timestamp: `${timestamp}`,
            iat: timestamp,
            exp: timestamp + 500
        }
        let token = jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: '500ms' });

        let data:WebhookBody = {
            repo: github.context.repo.repo,
            artifact_id: parseInt(ARTIFACT_ID),
            issue_num: ISSUE_NUM
        }

        axios.post(API_URL, data, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((res) => {
            console.log(res.data);
        }).catch((err) => {
            console.log(err);
        })
    } catch (error) {
        core.setFailed(error.message);
    }
}
run();
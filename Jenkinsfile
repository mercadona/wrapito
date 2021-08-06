#!groovy

@Library('mercadonaonline')
import org.mercadonaonline.SlackNotifications
import org.mercadonaonline.StatusTesters
import org.mercadonaonline.Kubernetes
import org.mercadonaonline.Registry
import org.mercadonaonline.General

def slack = new SlackNotifications(this)
def tester = new StatusTesters(this)
def k8s = new Kubernetes(this)
def registry = new Registry(this)
def general = new General(this)

node {
    general.checkoutWithTags()
}

pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '30', artifactNumToKeepStr: '1'))
    }

    environment {
        IMAGE_NAME = "midona-library-burrito-nginx"
        BUILD_WORKSPACE = "${env.WORKSPACE.replace(env.JENKINS_JOBS, '/var/jenkins_home/jobs')}"
        DOCKER_BUILD_NETWORK = "$BUILD_ID"+"${env.BRANCH_NAME.replace('/','').replace('_','').replace('-','').toLowerCase()}"+"_test"
        DOCKER_CONTEXT_WORKSPACE = "${env.WORKSPACE.replace('/var/jenkins_home/jobs', env.JENKINS_JOBS)}"
        NODE_IMAGE = "eu.gcr.io/itg-mimercadona/node:10.16.0-0.8.0"
    }

    stages {

        stage ('Preparations') {
            steps {
                script {
                    slack.initializeGitVariables()
                    k8sEnvironment = 'staging'
                    k8sShortNamespace = 'sta'
                    associatedGitTag = general.getAssociatedTag()
                    env.NODE_IMAGE_VERSION = registry.getImageTag()
                    if (env.TAG_NAME) {
                        env.NODE_IMAGE_VERSION = associatedGitTag
                        k8sEnvironment = 'production'
                        k8sShortNamespace = 'prod'
                    }
                    env.GID = sh(returnStdout: true, script: 'id -g $USER').trim()
                    env.UID = sh(returnStdout: true, script: 'id -u $USER').trim()
                    changelog = sh(
                        returnStdout: true,
                        script: "bash " + "scripts/generate_changelog.sh ${associatedGitTag}"
                    ).trim()
                    sh 'env'
                    general.restoreFilePermissions(env.DOCKER_CONTEXT_WORKSPACE, env.UID, env.GID)
                }
            }
        }

        stage ('Install dependencies') {
            steps {
                script {
                    sh 'docker login -u _json_key -p "$(cat $HOME/.gcp/gcp.json)" https://eu.gcr.io'
                }
                script {
                    // Always we build based on the git commit and the environment is determined by that fact.
                    sh 'docker run --rm -m=4g -v $JENKINS_JOBS:/var/jenkins_home/jobs --workdir $BUILD_WORKSPACE --name $DOCKER_BUILD_NETWORK-install $NODE_IMAGE npm install --no-optional'
                }
            }
        }

        stage ('Tests') {
            when {
                environment name: 'TAG_NAME', value: ''
            }
            steps {
                script {
                    sh 'docker run --rm -m=4g -v $JENKINS_JOBS:/var/jenkins_home/jobs -e NODE_ENV="jenkins" --workdir $BUILD_WORKSPACE --name $DOCKER_BUILD_NETWORK-build $NODE_IMAGE npm run test'
                }
            }
        }

        stage ('Publish') {
            when {
                expression {
                    (env.TAG_NAME)
                }
            }
            steps {
                script {
                    script {
                        sh "docker run --rm -m=4g -v $JENKINS_JOBS:/var/jenkins_home/jobs -e NODE_ENV='jenkins' -e NODE_IMAGE_VERSION=$NODE_IMAGE_VERSION --workdir $BUILD_WORKSPACE --name $DOCKER_BUILD_NETWORK-build $NODE_IMAGE npm version --no-git-tag-version $TAG_NAME"
                        sh "docker run --rm -m=4g -v $JENKINS_JOBS:/var/jenkins_home/jobs -e NODE_ENV='jenkins' -e NODE_IMAGE_VERSION=$NODE_IMAGE_VERSION --workdir $BUILD_WORKSPACE --name $DOCKER_BUILD_NETWORK-build $NODE_IMAGE npm run publish-package"
                    }
                }
            }
        }

        stage ('Send release to Github') {
            when {
                expression {
                    (env.TAG_NAME)
                }
            }
            steps {
                script {
                    general.sendReleaseToGithub(associatedGitTag, changelog)
                }
            }
        }
    }

    post {
        always {
            script {
                general.restoreFilePermissions(env.BUILD_WORKSPACE, env.UID, env.GID)
                if (env.TAG_NAME == null) {
                    step([$class: 'JUnitResultArchiver', testResults: 'results/tests/*-junit.xml'])
                    step([
                        $class: 'CloverPublisher',
                        cloverReportDir: 'coverage/',
                        cloverReportFileName: 'clover.xml',
                        healthyTarget: [methodCoverage: 60, conditionalCoverage: 60, statementCoverage: 60],    // optional, default is: method=70, conditional=80, statement=80
                        unhealthyTarget: [methodCoverage: 50, conditionalCoverage: 50, statementCoverage: 50],  // optional, default is none
                        failingTarget: [methodCoverage: 0, conditionalCoverage: 0, statementCoverage: 0]     // optional, default is none
                    ])
                }
                if (env.TAG_NAME) {
                    slack.finalNotify('#frontend', tester.testStatuses())
                } else {
                    slack.finalNotify('#logistics_events', tester.testStatuses())
                }
            }
        }
    }
}

#!/bin/bash
# Deploy Astro static site to S3 with CloudFront invalidation
# Usage: bash deploy.sh

set -e

##
# Configuration
##
AWS_PROFILE="your-aws-profile"
BUCKET="s3://your-bucket-name"
SITE_DIR="dist/"
CLOUDFRONT_DISTRIBUTION_ID="your-cloudfront-distribution-id"

##
# Deploy
##
echo "Syncing ${SITE_DIR} to ${BUCKET}..."
AWS_PROFILE=$AWS_PROFILE aws s3 sync $SITE_DIR $BUCKET --delete

echo "Creating CloudFront invalidation..."
AWS_PROFILE=$AWS_PROFILE aws --no-cli-pager cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"

echo "Deploy complete!"

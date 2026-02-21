#!/bin/bash
# Deploy Astro static site to S3 with CloudFront invalidation
# Usage: bash deploy.sh
#
# Required environment variables:
#   CLOUDFRONT_DISTRIBUTION_ID - CloudFront distribution ID for cache invalidation
#
# Optional environment variables:
#   AWS_PROFILE - AWS CLI profile name (default: default)
#   BUCKET      - S3 bucket URL (default: s3://your-bucket-name)

set -e

##
# Configuration
##
AWS_PROFILE="${AWS_PROFILE:-default}"
BUCKET="${BUCKET:-s3://your-bucket-name}"
SITE_DIR="dist/"

# CloudFront distribution ID must be set via environment variable
if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "Error: CLOUDFRONT_DISTRIBUTION_ID environment variable is required"
    exit 1
fi

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

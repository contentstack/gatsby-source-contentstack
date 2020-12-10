# gatsby-source-contentstack

Contentstack provides a source plugin for pulling content into [Gatsby][gatsby] from [Contentstack][contentstack] stacks. It helps you query content types and entries in Gatsby using GraphQL.

Here’s an example site built using this source plugin: https://xenodochial-hodgkin-8a267e.netlify.com/

## Install

`npm install --save gatsby-source-contentstack`

## How to use

Open the gatsby-config.js file from the root directory of your Gatsby project and configure it with below parameters

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-contentstack`,
    options: {
      // Required: API Key is a unique key assigned to each stack.
      api_key: `api_key`,

      // Required: Delivery Token is a read-only credential. 
      delivery_token: `delivery_token`,
      
      // Required: Environment where you published your data.
      environment: `environment`,

      // Optional: CDN set this to point to other cdn end point. For eg: https://eu-cdn.contentstack.com/v3 
      cdn: `cdn_url`,

      // Optional: expediteBuild set this to either true or false
      expediteBuild: `boolean_value`,

      // Optional: Specify true if you want to generate custom schema
      enableSchemaGeneration : `boolean_value`,

      // Optional: Specify a different prefix for types. This is useful in cases where you have multiple instances of the plugin to be connected to different stacks.
      type_prefix: `Contentstack`, // (default)

      // Optional: Specify true if you want to download all your contentstack images locally
      downloadImages: `boolean_value`
    },
  },
]
// Note: access_token has been replaced by delivery_token
```
There is a provision to speed up the ```gatsby build``` process. To do this, you can set the value of the **expediteBuild** to **true**. So when you set the value of this parameter to true, the build process is significantly enhanced as only published assets and entries are synced parallelly. 

However, when you want to perform ```gatsby develop```, ensure to set the value of **expediteBuild** to **false**.

## How to query

You can query nodes created from Contentstack using GraphQL. 


All content types and the corresponding entries are pulled from your stack. They'll be created in your site's GraphQL schema under `contentstack${contentTypeID}` and `allContentstack${contentTypeID}`.

**Note**: Learn to use the GraphQL tool and Ctrl+Spacebar at
<http://localhost:8000/___graphql> to discover the types and properties of your
GraphQL model.

### Querying entries

If, for example, you have `Blogs` as one of your content types, you will be able to query its entries in the following manner:


```graphql
{
  allContentstackBlogs {
    edges {
      node {
        id
        title
        url
        description
        banner {
          filename
          localAsset {
            base
            absolutePath
            publicURL
            url
            childImageSharp {
              fixed(width: 125, height: 125) {
                base64
              }
            }
          }
        }
        created_at
      }
    }
  }
}
```

### Query Reference fields

Reference fields provide references to entries of another content type(s). Since fields from
referred entry is often needed, the referred entry data is provided at the `reference` field.

```graphql
{
  allContentstackBlogs{
    edges {
      node {
        id
        title
        url
        description
        authors{
          name
        }
        created_at
      }
    }
  }
}
```

### Querying downloaded images

## Prerequisites

To use this, you need to have the following plugins installed:

- gatsby-transformer-sharp
- gatsby-plugin-sharp
- gatsby-source-filesystem

```graphql
{
  allContentstackAssets {
    edges {
      node {
        id
        title
        localAsset {
          childImageSharp {
            fluid {
              base64
              aspectRatio
              src
              srcSet
              sizes
            }
          }
        }
      }
    }
  }
}
```

Note: By default, 20 images can be downloaded concurrently. However, if you want to download more you can set GATSBY_CONCURRENT_DOWNLOAD=100.

For ex:- GATSBY_CONCURRENT_DOWNLOAD=100 gatsby develop

Remember that gatbsy-image doesn’t support GIF and SVG images.

To use GIF image, Gatsby recommends to import the image directly. In the case of SVG, creating multiple variants of the image doesn’t make sense because it is vector-based graphics that you can freely scale without losing quality.


[gatsby]: https://www.gatsbyjs.org/
[contentstack]: https://www.contentstack.com/
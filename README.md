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
      // API Key is a unique key assigned to each stack. This is required.
      api_key: `api_key`,

      // Delivery Token is a read-only credential . This is required.
      delivery_token: `deliver_token`,
      
      // Environment where you published your data.
      environment: `environment`
    },
  },
]
```

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
          url
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

## Coming soon

- Asset type and Image processing support using `gatsby-transformer-sharp`, `gatsby-plugin-sharp`.



[gatsby]: https://www.gatsbyjs.org/
[contentstack]: https://www.contentstack.com/

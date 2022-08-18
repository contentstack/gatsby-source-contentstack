# gatsby-source-contentstack

Contentstack provides a source plugin for pulling content into [Gatsby][gatsby] from [Contentstack][contentstack] stacks. It helps you query content types and entries in Gatsby using GraphQL.

Here’s an example site built using this source plugin: https://xenodochial-hodgkin-8a267e.netlify.com/

## Install

`npm install --save gatsby-source-contentstack`

## How to use

Open the gatsby-config.js file from the root directory of your Gatsby project and configure it with below parameters


```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-contentstack`,
      options: {
        api_key: `api_key`,
        delivery_token: `delivery_token`,
        environment: `environment`,
      }
    }
  ]
};
```


## Plugin options

| Option                 | Required | Type     | Description                                                |
| ---------------------- | -------- | -------- | ---------------------------------------------------------- |
| api_key                | yes      | string   | Unique key assigned to each stack                          |
| delivery_token         | yes      | string   | read-only credential                                       |
| environment            | yes      | string   | Environment where you published your data                  |
| cdn                    | no       | string   | cdn end point. For eg: https://eu-cdn.contentstack.com/v3  |
| expediteBuild          | no       | boolean  | Significantly enhances build process                       |
| enableSchemaGeneration | no       | boolean  | Generate custom schema                                     |
| disableMandatoryFields | no       | boolean  | Generate optional graphql fields                           |
| type_prefix            | no       | string   | Specify a different prefix for types. For eg: Contentstack |
| downloadImages         | no       | boolean  | Download images to disk                                    |
| contentTypes           | no       | string[] | Explicitly set which content types to include              |
| excludeContentTypes    | no       | string[] | Explicitly set which content types to exclude              |
| locales                | no       | string[] | Which language data to fetch                               |


There is a provision to speed up the ```gatsby build``` process. To do this, you can set the value of the **expediteBuild** to **true**. So when you set the value of this parameter to true, the build process is significantly enhanced as only published assets and entries are synced parallelly. 

However, when you want to perform ```gatsby develop```, ensure to set the value of **expediteBuild** to **false**.

## How to query

You can query nodes created from Contentstack using GraphQL. 


All content types and the corresponding entries are pulled from your stack. They'll be created in your site's GraphQL schema under `contentstack${contentTypeID}` and `allContentstack${contentTypeID}`.

**Note**: Learn to use the GraphQL tool and Ctrl+Spacebar at
<http://localhost:8000/___graphql> to discover the types and properties of your
GraphQL model.

## Querying entries

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

## Query Reference fields

Reference fields provide references to entries of another content type(s). Since fields from
referred entry are often needed, the referred entry data is provided at the `reference` field.

**Note**: If referenced entries are not published or deleted, then the query will not return those entries in the response.

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

## Querying downloaded images

## Prerequisites

To use this, you need to have the following plugins installed:

- gatsby-transformer-sharp
- gatsby-plugin-sharp
- gatsby-source-filesystem
- gatsby-plugin-image

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

To use GIF image, Gatsby recommends to import the image directly. In SVG, creating multiple variants of the image doesn’t make sense because it is vector-based graphics that you can freely scale without losing quality.

## The new gatsby image plugin

The gatsby-image plugin lets you add responsive images to your site. By using this plugin, you can format and produce images of various qualities and sizes.

## Prerequisites

To use this, you need to have the following plugins installed:

- gatsby-plugin-image
- gatsby-plugin-sharp
- gatsby-transformer-sharp

# Description

Next step is to add an image to your page query and use the gatsbyImageData resolver to pass arguments that will configure your image.

The gatsbyImageData resolver allows you to pass arguments to format and configure your images. 
Using the Contentstack Image delivery APIs you can perform various operations on the images by passing the necessary parameters.

Lets understand this with an example.
In the below example we have added several parameters to format the image. 

```graphql
{
  allContentstackBlog {
    edges {
      node {
        title
        image {
          gatsbyImageData(
            layout: CONSTRAINED
            crop: "100,100"
            trim: "25,25,100,100"
            backgroundColor:"cccccc"
            pad: "25,25,25,25"
          )
        }
      }
    }
  }
}
```

Lets understand some parameters that we defined:
layout: This defines the layout of the image, it can be CONSTRAINED, FIXED or FULL_WIDTH.
The crop, trim, backgroundColor and pad parameters configure the image according to the values inserted by the user. 

Note: To learn more about these parameters and other available options, read our detailed documentation on [Contentstack Image delivery APIs](https://www.contentstack.com/docs/developers/apis/image-delivery-api/).

This query below returns the URL for a 20px-wide image, to use as a blurred placeholder.
The image is downloaded and converted to a base64-encoded data URI.

Here’s an example of the same:
```graphql
{
  allContentstackBlog {
    edges {
      node {
        title
        image {
          gatsbyImageData(
            layout: CONSTRAINED
            placeholder: BLURRED
            crop: "100,100"
            trim: "25,25,100,100"
            backgroundColor:"cccccc"
            pad: "25,25,25,25"
          )
        }
      }
    }
  }
}
```

For more information checkout gatsby's image plugin documentation on usage of the [new image plugin](https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/adding-gatsby-image-support/).

For more information on region support please refer [About Region's](https://www.contentstack.com/docs/developers/contentstack-regions/api-endpoints/)

[gatsby]: https://www.gatsbyjs.org/
[contentstack]: https://www.contentstack.com/
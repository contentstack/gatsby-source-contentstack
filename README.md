# gatsby-source-contentstack

Contentstack provides a source plugin for pulling content into [Gatsby][gatsby] from [Contentstack][contentstack] stacks. It helps you query content types and entries in Gatsby using GraphQL.

Here’s an example site built using this source plugin: https://xenodochial-hodgkin-8a267e.netlify.com/

##### **NOTE**

> - Use Node v18+ and React v18+ while using v5.x.x of gatsby-source-contentstack.
> - Please refer migration guide: [Migrating from v4 to v5](https://v5.gatsbyjs.com/docs/reference/release-notes/migrating-from-v4-to-v5/)
> - Added support for subsequent fetch calls when data is being published during ongoing init calls or build process.

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

      // Optional: Specify branch name. Default it would fetch from "main".
      branch: `branch name`,

      // Optional: CDN set this to point to other cdn end point. For eg: https://eu-cdn.contentstack.com/v3
      cdn: `cdn_url`,

      // Recommended: Specify true if you want to fetch/source data parallelly. It enhances the performance on both gatsby build/develop command.
      expediteBuild: `boolean_value`,

      // Recommended: Specify true if you want to generate custom schema when the content type models are complex.
      enableSchemaGeneration : `boolean_value`,

      // Optional: Specify true if you want to generate optional graphql fields for mandatory Contentstack fields
      disableMandatoryFields : `boolean_value`,

      // Optional: Specify a different prefix for types. This is useful in cases where you have multiple instances of the plugin to be connected to different stacks.
      type_prefix: `Contentstack`, // (default)

      // Optional: Specify true if you want to download all your contentstack images locally
      downloadImages: `boolean_value`,

      // Optional: Specify the content types from which you want the plugin to retrieve data.
      contentTypes: [‘blog’,’author’],
      // This will fetch the data of the ‘blog’ and ‘author’ content types only.

      // Optional: Specify the content types that the plugin should exclude while fetching data of all content types.
      excludeContentTypes: [‘home’,’about’],
      // This will fetch the data of all the available content types excluding the ‘home’ and ‘about’ content types.

      // Optional: Include the locales that you want the plugin to fetch data from.
      locales: [‘en-us’,’fr-fr’],
      // In this case, the plugin will fetch only English (United States) and French (France) language data.

      // Optional: Specify true to convert the JSON-RTE repsonse to HTML. Default it is set to false
      jsonRteToHtml: false ,

      // Optional: Specify a number to perform http-retries for network failures. By default it is set to 3.
      httpRetries: 2,

      //Specify the number of entries/assets to be fetched per page. Maximum limit accepted is 100.
      limit: 50
    },
  },
]
// Note: access_token is replaced by delivery_token
```
There is a provision to speed up the `gatsby build` process. To do this, you can set the value of the **expediteBuild** to **true**. So when you set the value of this parameter to true, the build process is significantly enhanced as only published assets and entries are synced parallelly.

However, when you want to perform `gatsby develop`, ensure to set the value of **expediteBuild** to **false**.

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
  allContentstackBlogs {
    edges {
      node {
        id
        title
        url
        description
        authors {
          name
        }
        created_at
      }
    }
  }
}
```

## Querying global fields

Global fields provide a convenient way of capturing a common set of fields. These implement
a common interface which can be used to commonise between different types using the global field.

For example, suppose you used a global field for author information:

```graphql
fragment Author on contentstack_author {
  name
}

query {
  allContentstackBlogs {
    node {
      authors {
        ...Author
      }
    }
  }
  allContentstackArticles {
    node {
      authors {
        ...Author
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
            backgroundColor: "cccccc"
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
            backgroundColor: "cccccc"
            pad: "25,25,25,25"
          )
        }
      }
    }
  }
}
```

## Using live preview

Since version 5.1, a class - `ContentstackGatsby` is provided which facilitates the setup of live preview.

Initialize `ContentstackGatsby` and live preview SDK.

```jsx
import { ContentstackGatsby } from 'gatsby-source-contentstack/live-preview';
import ContentstackLivePreview from '@contentstack/live-preview-utils';

export const getCSData = new ContentstackGatsby({
  api_key: GATSBY_CONTENTSTACK_API_KEY,
  environment: GATSBY_CONTENTSTACK_ENVIRONMENT,
  live_preview: {
    management_token: GATSBY_CONTENTSTACK_MANAGEMENT_TOKEN,
    enable: true,
    host: 'api.contentstack.io', // "eu-api.contentstack.com" for EU region
  },
});

ContentstackLivePreview.init({
  stackSdk: getCSData.stackSdk,
});
```

Next, in a page/component, pass a function to `ContentstackLivePreview`'s `onEntryChange()` or `onLiveEdit()` method. This function should call ContentstackGatsby.get() with the initial data as a parameter.

```jsx
const Home = props => {
  const [data, setData] = useState(props.data.allContentstackPage.nodes[0]);

  const fetchLivePreviewData = async () => {
    const updatedData = await getCSData.get(
      props.data.allContentstackPage.nodes[0]
    );
    setData(updatedData);
  };

  useEffect(() => {
    ContentstackLivePreview.onLiveEdit(fetchLivePreviewData);
  }, []);

  return <div>{data.title}</div>;
};
```

For more information on using live preview, please refer to [Set up Live Preview](https://www.contentstack.com/docs/developers/sample-apps/build-a-starter-website-with-gatsby-and-contentstack#set-up-live-preview-optional) for Gatsby sites.

For more information checkout gatsby's image plugin documentation on usage of the [new image plugin](https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/adding-gatsby-image-support/).

For more information on region support please refer [About Region's](https://www.contentstack.com/docs/developers/contentstack-regions/api-endpoints/)

[gatsby]: https://www.gatsbyjs.org/
[contentstack]: https://www.contentstack.com/

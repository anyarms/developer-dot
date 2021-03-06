import {buildPostmanCollection, buildAuth} from './react/api-app/helpers';
import {buildQsPath, buildCurl, buildInitialPostBodyData} from './react/shared/helpers';

// Given array of parameters, filters out non-query string params and converts them to consummable shape
const buildSchema = (schema, required = [], excludedProperties = [], propName = null) => {
    if (schema.hasOwnProperty('x-visibility') && schema['x-visibility'] === 'hidden') {
        return undefined;
    }

    if ((!schema.type || schema.type === 'object') && !schema.properties && !schema.hasOwnProperty('allOf')) {
        return undefined;
    }

    if (schema.hasOwnProperty('allOf')) {
        return schema.allOf.map((chunk) => (buildSchema(chunk))).reduce((accum, chunk) => {
            return Object.assign({}, accum, chunk);
        }, {});
    }

    if (schema.type && schema.type === 'object' || schema.type === undefined) {
        const nestedSchemaProps = Object.keys(schema.properties).map((nestedPropName) => ({[nestedPropName]: buildSchema(schema.properties[nestedPropName], schema.required, schema['x-excludedProperties'], nestedPropName)}));

        return Object.assign({uiState: {visible: true}, required: required.includes(propName), isExcluded: excludedProperties.includes(propName)}, ...nestedSchemaProps);
    }

    if (schema.type && schema.type === 'array') {
        const arraySchema = buildSchema(schema.items, schema.items.required, schema.items['x-excludedProperties']);

        // items holds the schema definition of objects in our array, and value holds the actual objects of said schema...
        // note that uiState is stored in the items property of the array, so don't need it at top level'
        return {fieldType: schema.type, required: required.includes(propName), isExcluded: excludedProperties.includes(propName), items: arraySchema};
    }

    const objToReturn = {fieldType: schema.type, required: required.includes(propName), isExcluded: excludedProperties.includes(propName)};

    if (schema.example) {
        objToReturn.example = schema.example;
    }
    if (schema.description) {
        objToReturn.description = schema.description;
    }
    if (schema.enum) {
        objToReturn.enum = schema.enum;
    }
    if (schema.format) {
        objToReturn.format = schema.format;
    }
    if (schema.hasOwnProperty('minimum')) {
        objToReturn.minimum = schema.minimum;
    }
    if (schema.hasOwnProperty('maximum')) {
        objToReturn.maximum = schema.maximum;
    }

    return objToReturn;
};

// Used to generate either query string or path parameters:
// paramType should be either 'query' or 'path'
const buildRequestParams = (params, paramType) => {
    if (paramType !== 'query' && paramType !== 'path' && paramType !== 'header') {
        throw new Error('In parseSwaggerUI.buildRequestParams: Invalid `paramType` ' + paramType);
    }
    return params.filter((p) => (p.in === paramType)).reduce((paramObj, p) => (
    {...paramObj, [p.name]: {description: p.description, required: p.required, value: '', example: p.example || p['x-example'] || '', enum: p.enum, fieldType: p.type}}
    ), {});
};

const buildPostBody = (endpointParams) => {
    const postBodyParams = endpointParams.filter((p) => (p.in === 'body'));

    // Can only be one post body per request, so safe to take first item
    return postBodyParams.length ? buildSchema(postBodyParams[0].schema) : null;
};

export default (api, rootPath) => {
    // Build base URL path (e.g. http://localhost:8082/v3)

    const scheme = api.schemes && api.schemes[0] ? api.schemes[0] : 'http';
    const root = (scheme && api.host && api.basePath) ? scheme + '://' + api.host + (api.basePath !== '/' ? api.basePath : '') : rootPath;

    const proxyRoot = api['x-api-proxy'] || null;

    const swaggerData = {
        apiName: api.info.title,
        apiDescription: api.info.description,
        appLoaded: false,
        apiType: api['x-ApiType'] || 'SOAP',
        sampleAuthHeader: api['x-sample-auth-header'] || null,
        sampleContentType: api.consumes || null
    };

    swaggerData.auth = buildAuth(api['x-auth-formula']);

    swaggerData.apiEndpoints = [];

    Object.keys(api.paths).forEach((k) => {
        const endpoint = api.paths[k];

        Object.keys(endpoint).forEach((action) => {
            const apiMethod = {
                name: endpoint[action].summary || endpoint[action].operationId,
                description: endpoint[action].description,
                path: root + k,
                action: action,
                isAuthenticated: Boolean(swaggerData.auth),
                showExcludedPostBodyFields: false // Determines whether or not we show API console input fields for params in the 'x-excludedProperties' array in Swagger
            };

            const endpointParams = endpoint[action].parameters || [];
            const headerParams = buildRequestParams(endpointParams, 'header');
            const pathParams = buildRequestParams(endpointParams, 'path');
            const queryString = buildRequestParams(endpointParams, 'query');

            const postBody = buildPostBody(endpointParams);

            if (proxyRoot) {
                apiMethod.proxyRoute = proxyRoot + k;
            }

            if (Object.keys(headerParams).length) {
                apiMethod.headerParams = headerParams;
            }
            if (Object.keys(pathParams).length) {
                apiMethod.pathParams = pathParams;
            }
            if (Object.keys(queryString).length) {
                apiMethod.queryString = queryString;
                apiMethod.qsPath = buildQsPath(queryString);
            }
            if (postBody) {
                apiMethod.postBody = postBody;
                apiMethod.postBodyData = buildInitialPostBodyData(postBody, apiMethod.showExcludedPostBodyFields);
            }

            apiMethod.curl = buildCurl(swaggerData.auth, apiMethod);

            if (endpoint[action].responses[200].schema) {
                apiMethod.responseSchema = buildSchema(endpoint[action].responses[200].schema);
            }

            apiMethod.requestSchema = buildPostBody(endpointParams);

            swaggerData.apiEndpoints.push(apiMethod);
        });
    });

    swaggerData.postmanCollection = buildPostmanCollection(swaggerData);

    return swaggerData;
};

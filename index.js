'use strict'

var SwaggerModel = require('./lib/swagger-api'),
    jsonRefs = require('json-refs'),
    debug = require('debug')('model2oas'),
    path = require('path'),
    merge = require('merge');

module.exports = {
  generateSwaggerAt: generateSwaggerAt,
  generateSwagger: generateSwagger
}

function generateSwaggerAt( dataModelJsonPath ){
  var fullPath = path.join( process.cwd(), dataModelJsonPath );
  return getSpec( require( fullPath ), path.parse( fullPath ).dir );
}

function generateSwagger( dataModelJson ) {
  // required to support object as a parameter
  if( typeof dataModelJson != 'object') {
    throw new Error('Invalid datamodel type. Object type expected.');
  }
  return getSpec( dataModelJson, undefined );
}

function getSpec( dataModelJsonPath, path ) {
  return jsonRefs.resolveRefs( dataModelJsonPath, {
        filter: ['relative', 'remote', 'local'],
        relativeBase: path
      } )
      .then( function( dmResolved ) {
        debug('data model resolved', dmResolved);
        return dmResolved.resolved;
      })
      .then( function( dataModelResolved ) {
        return SwaggerModel( dataModelResolved )
            .then( function( swaggerDoc ) {
              return merge( swaggerDoc.getBase, swaggerDoc.getInfo, swaggerDoc.getPaths );
            })
            .catch( function ( err ) {
              console.log( err.stack );
              throw err;
            });
      })
}
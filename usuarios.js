'use strict';
const connection = require('../connection');

module.exports.findRol = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info
    
    const sql = 'SELECT * FROM pos.rol';
 
    var data = {};
    var data2 = {};

    connection.query(sql, (error, rows) => {
      if (error) {
        callback({
          statusCode: 500,
          body: JSON.stringify(error)
        })
      } else {
        callback(null, { //inicio rows
            statusCode: 200,
            headers: {

              'Access-Control-Allow-Origin': '*',

              'Access-Control-Allow-Credentials': true,

            },
            body: JSON.stringify({
              roles: rows
            })
          }); //final callback

      }
       
    } //final  query

)};

module.exports.findUser = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info
  
  //const sql = 'SELECT pos.usuario.idusuario,pos.usuario.username, pos.empleado.nombre, pos.empleado.idempleado, pos.empleado.idsucursal FROM pos.usuario INNER JOIN pos.empleado  ON pos.usuario.idempleado = pos.empleado.idempleado';
  
  const sql = `
  SELECT pos.usuario.idusuario,pos.usuario.estado AS "estado_usuario", pos.usuario.username, pos.empleado.idempleado,pos.empleado.nombre AS "nombre_empleado", pos.rol.idrol, pos.rol.nombre AS "nombre_rol"
  FROM pos.usuario INNER JOIN pos.rol INNER JOIN pos.empleado
  ON pos.usuario.idrol = pos.rol.idrol and pos.usuario.idempleado = pos.empleado.idempleado`;
  var data = {};
  var data2 = {};

  connection.query(sql, (error, rows) => {
    if (error) {
      callback({
        statusCode: 500,
        body: JSON.stringify(error)
      })
    } else {
      callback(null, { //inicio rows
          statusCode: 200,
          headers: {

            'Access-Control-Allow-Origin': '*',

            'Access-Control-Allow-Credentials': true,

          },
          body: JSON.stringify({
            usuarios: rows
          })
        }); //final callback

    }
     
  } //final  query

)};
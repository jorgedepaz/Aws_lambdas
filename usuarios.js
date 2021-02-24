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

module.exports.updateUser = (event, context, callback) => {

  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
  var rules = {
    iduser: 'required|integer',
    username: 'required|string|max:45',
    password: 'required|string|max:255',
    estado: 'required|integer',
    idempleado: 'required|integer',
    idrol: 'required|integer'
  };
  let validation = new Validator(body, rules);



  if (validation.passes()) {

    var newUser = {
      iduser: body.iduser,
      username: body.username,
      password: body.password,
      estado: body.estado,
      idempleado: body.idempleado,
      idrol: body.idrol
    }

    console.log("Este es el usuario: ");
    console.log(newUser);


    (async function () { //Funcion (IIFE) ‘immediately invoked function expression’

      newUser.password = await helpers.encryptPassword(newUser.password);
      console.log("Este es el nuevo usuario: ");
      console.log(newUser);
      connection.beginTransaction(function (err) {
        var idG;
        if (err) {
          throw err;
        }
        connection.query('SELECT * FROM pos.empleado WHERE idempleado = ?', [newUser.idempleado], function (error, results, fields) { //query para consultar empleados
          if (error) {
            return connection.rollback(function () {
              throw error;
            });
          } else {
            if (results!= "") {
              
            
        connection.query('SELECT * FROM pos.rol WHERE idrol = ?', [newUser.idrol], function (error, results, fields) { //query para consultar roles
          if (error) {
            return connection.rollback(function () {
              throw error;
            });
          } else {
            if (results!="") {
              
            connection.query('SELECT * FROM pos.usuario WHERE username = ?', [newUser.username], function (error, results, fields) { //query para insertar el documento venta
              if (error) {
                return connection.rollback(function () {
                  throw error;
                });
              } else {

                if (results != "") {
                  connection.commit(function (err) { //inicio del commit
                    console.log("Mensaje desde el commit");
                    if (err) {
                      return connection.rollback(function () {
                        throw err;
                      });
                    } else {
                      callback(null, {
                        statusCode: 500,
                        headers: {

                          'Access-Control-Allow-Origin': '*',

                          'Access-Control-Allow-Credentials': true,

                        },
                        body: JSON.stringify({
                          message: 'Ya existe un usuario con el mismo nombre, intente con otro'
                        })
                      })
                    } //final del else
                  }) //final del commit        
                } else {

                  connection.query('INSERT INTO pos.usuario SET ?', [newUser], function (error, results1, fields) { //query para insertar el documento venta
                    if (error) {
                      return connection.rollback(function () {
                        throw error;
                      });
                    } else {

                      console.log(results1.insertId);
                      newUser.id = results1.insertId;
                      connection.commit(function (err) { //inicio del commit
                        console.log("Mensaje desde el commit");
                        if (err) {
                          return connection.rollback(function () {
                            throw err;
                          });
                        } else {
                          callback(null, {
                            statusCode: 200,
                            headers: {

                              'Access-Control-Allow-Origin': '*',

                              'Access-Control-Allow-Credentials': true,

                            },
                            body: JSON.stringify({
                              message: 'Usuario registrado correctamente',
                              id: newUser.id
                            })
                          })
                        } //final del else
                      }) //final del commit  

                    }//final del else para los usuarios
                  }); //final de la query para insertar el nuevo usuario

                } //else para cuando no existe el usuario

              } //final del else de usuarios
            }); //final de la query para saber si ya existe el usuario
          
          }//final del if para cuando el rol no exista
          else{
            connection.commit(function (err) { //inicio del commit
              console.log("Mensaje desde el commit");
              if (err) {
                return connection.rollback(function () {
                  throw err;
                });
              } else {
                callback(null, {
                  statusCode: 500,
                  headers: {

                    'Access-Control-Allow-Origin': '*',

                    'Access-Control-Allow-Credentials': true,

                  },
                  body: JSON.stringify({
                    message: 'Esta tratando de insertar un usuario con un rol invalido'
                  })
                })
              } //final del else
            }) //final del commit 
          }
          } //final del else de los roles
        }); //final de la query para consultar roles


    }//final del if para cuando el empleado no exista
          else{
            connection.commit(function (err) { //inicio del commit
              console.log("Mensaje desde el commit");
              if (err) {
                return connection.rollback(function () {
                  throw err;
                });
              } else {
                callback(null, {
                  statusCode: 500,
                  headers: {

                    'Access-Control-Allow-Origin': '*',

                    'Access-Control-Allow-Credentials': true,

                  },
                  body: JSON.stringify({
                    message: 'Esta tratando de insertar un usuario con un empleado inexistente'
                  })
                })
              } //final del else
            }) //final del commit 
          }
      } //final del else de los empleados
    }); //final de la query para consultar empleados

      }); //final begin transaction
    })();//final de la funcion asicrona



  } //final del if para la validacion
  else {

    callback(null, {
      statusCode: 500,
      headers: {

        'Access-Control-Allow-Origin': '*',

        'Access-Control-Allow-Credentials': true,

      },
      body: JSON.stringify({
        message: 'Datos incorrectos'
      })
    })

  }

} //Final de la funcion
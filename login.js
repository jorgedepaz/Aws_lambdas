'use strict';
const connection = require('../connection');
const Validator = require('validatorjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports.login = (event, context, callback) =>{

    context.callbackWaitsForEmptyEventLoop = false;
    const body = JSON.parse(event.body);

    var payload = {};
    var signOptions = {};
    
    var usuario = {
      idusuario: null,
      username: null
    };

    var empleado = {
      idsucursal: null,
      idempleado: null,
      nombre: null
    };

    var rol = {
      idrol: null,
      nombre: null
    };

    var rol_permisos = [];

    var permisos = {
      idpermiso: null,
      nombre: null
    };

    var rules = {
      username: 'required|string|max:45',
      password: 'required|string|max:255'
    };
    let validation = new Validator(body, rules);
    
    
  
    if (validation.passes()) {
  
    const User = {
        username:body.username,
        password:body.password
      }
  
      console.log("Este es el usuario: ");
      console.log(User);
       connection.beginTransaction(function (err) {
        var idG;
        if (err) {
          throw err;
        }
        let sqlUsuarioRol = "SELECT pos.usuario.idusuario, pos.usuario.password, pos.usuario.username, pos.rol.idrol, pos.rol.nombre FROM pos.usuario INNER JOIN pos.rol ON pos.usuario.idrol = pos.rol.idrol WHERE username = ?";
      connection.query(sqlUsuarioRol,[User.username], function (error, results, fields) { //query para consultar el usuario
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }else{
            console.log("Resultados");
            console.log(results[0]);
            
          if(results != ""){
            //Armando objeto usuario para el payload
            usuario.idusuario = results[0].idusuario;
            usuario.username = results[0].username;
            rol.idrol = results[0].idrol;
            rol.nombre = results[0].nombre;
            
            console.log(usuario);
            console.log(rol);

            bcrypt.compare(User.password, results[0].password, function(err, result) {
                if (result) {
                    //Codigo para generar el token
                    let sqlEmpleado = "SELECT pos.usuario.idusuario, pos.empleado.idempleado, pos.empleado.nombre, pos.empleado.idsucursal FROM pos.usuario INNER JOIN pos.empleado ON pos.usuario.idempleado = pos.empleado.idempleado WHERE pos.usuario.idusuario = ?";//consulta para obtener el objeto que corresponde al empleado
                    connection.query(sqlEmpleado,[usuario.idusuario], function (error, results, fields) { //query para consultar empleado
                      if (error) {
                        return connection.rollback(function () {
                          throw error;
                        });
                      }else{
                        //crear aqui el objeto empleado con todos sus datos
                        //empleado.
                        console.log("Informacion del empleado");
                        
                        empleado.idempleado = results[0].idempleado;
                        empleado.idsucursal = results[0].idsucursal;
                        empleado.nombre = results[0].nombre;
                        
                        let sqlPermisos = "SELECT pos.rol_permiso.idpermiso, pos.permiso.nombre FROM pos.rol_permiso INNER JOIN pos.permiso ON rol_permiso.idpermiso = permiso.idpermiso WHERE rol_permiso.idrol = ?";//consulta para obtener el objeto que corresponde al empleado
                        connection.query(sqlPermisos,[rol.idrol], function (error, results, fields) { //query para consultar empleado
                          if (error) {
                            return connection.rollback(function () {
                              throw error;
                            });
                          }else{
                            rol_permisos = results; 
                            
                    payload = {
                        usuario,
                        empleado,
                        rol,
                        rol_permisos
                    }

                    signOptions = {
                        //expiresIn:  60    // 30 s
                     };
                     console.log("Payload");
                     console.log(payload);
                     
                    jwt.sign(payload,config.SECRET_TOKEN,signOptions, function(error,token){
                        
                      if (error) {//si existe error al generar el token
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
                                    message: error
                                })
                              });
                            } //final del else
                          }) //final del commit
                            
                        }else{

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
                                    message: "Bienvenido "+usuario.username,
                                    token
                                })
                              });
                            } //final del else
                          }) //final del commit
                       
                        }//final del else cuando se genera el token con exito
                    });//Final del jwt sign

                       }//final del else para consultar permisos
                 })//final de la query para consultar permisos

                   }//final del else para consultar empleado
                 })//final de la query para consultar empleado

                }//final del if para comparar el resultado que arroja bcrypt
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
                            message: "Contraseña incorrecta"
                        })
                      }); 
                    } //final del else
                  }) //final del commit
                 
                }
            });
             
            }else{
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
                        message: "No existe un usuario con ese nombre"
                    })
                  }); 
                } //final del else
              }) //final del commit 
            }
        }
        
      });//final de la query para consultar el usuario
    });//final de la transaccion 
  
    }//final del if para la validacion
    else{
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
  
    }//Final de la funcion

    /*(async function() {//Funcion (IIFE) ‘immediately invoked function expression’
  
        newUser.password =  await helpers.encryptPassword(newUser.password);
        console.log("Este es el nuevo usuario: ");
        console.log(newUser);
        connection.query('INSERT INTO pos.usuario SET ?',[newUser], function (error, results1, fields) { //query para insertar el documento venta
          if (error) {
            return connection.rollback(function () {
              throw error;
            });
          }else{
            
            console.log(results1.insertId);
            newUser.id = results1.insertId;
    
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
            
          }
        });//final de la query
  
      })();*/
'use strict';
const connection = require('../connection');
const Validator = require('validatorjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports.login = (event, context, callback) =>{

    context.callbackWaitsForEmptyEventLoop = false;
    const body = JSON.parse(event.body);

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
      
      connection.query('SELECT * FROM pos.usuario WHERE username = ?',[User.username], function (error, results, fields) { //query para insertar el documento venta
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }else{
            console.log("Resultados");
            console.log(results[0]);
            

          if(results != ""){

            bcrypt.compare(User.password, results[0].password, function(err, result) {
                if (result) {
                    //Codigo para generar el token
                    var payload = {
                        username: results[0].username
                    }
                    jwt.sign(payload,config.SECRET_TOKEN, function(error,token){
                        if (error) {
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
                        }else{
                            callback(null, {
                                statusCode: 200,
                                headers: {
                        
                                  'Access-Control-Allow-Origin': '*',
                        
                                  'Access-Control-Allow-Credentials': true,
                        
                                },
                                body: JSON.stringify({
                                    message: "Bienvenido "+results[0].username,
                                    token
                                })
                              });
                        }
                    });
                            
                }else{
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
                }
            });
             
            }else{
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
            }
        }
        
      });//final de la query

      

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
'use strict';

const connection = require('../connection');
const helpers = require('./helpers')
const Validator = require('validatorjs');

module.exports.login = (event, context, callback) =>{

    context.callbackWaitsForEmptyEventLoop = false;
    const body = JSON.parse(event.body);

    var rules = {
      username: 'required|string|max:45',
      password: 'required|string|max:255'
    };
    let validation = new Validator(body, rules);
    
    
  
    if (validation.passes()) {
  
    var User = {
        username:body.username,
        password:body.password
      }
  
      console.log("Este es el usuario: ");
      console.log(User);
      
      
      (async function() {//Funcion (IIFE) ‘immediately invoked function expression’
  
      /*  newUser.password =  await helpers.encryptPassword(newUser.password);
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
        });//final de la query*/
  
      })();
      
      
  
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
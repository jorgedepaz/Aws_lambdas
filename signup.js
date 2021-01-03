'use strict';

const connection = require('../connection');
const helpers = require('./helpers')
const Validator = require('validatorjs');


module.exports.signup = (event, context, callback) =>{

  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
  var rules = {
    username: 'required|string|max:45',
    password: 'required|string|max:255',
    estado: 'required|integer',
    idempleado: 'required|integer',
    idrol: 'required|integer'
  };
  let validation = new Validator(body, rules);
  
  

  if (validation.passes()) {

  var newUser = {
      username:body.username,
      password:body.password,
      estado:body.estado,
      idempleado:body.idempleado,
      idrol:body.idrol
    }

    console.log("Este es el usuario: ");
    console.log(newUser);
    
    
    (async function() {//Funcion (IIFE) ‘immediately invoked function expression’

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
/*
deserializeUser(async(id,done)=>{
  //se guarda el usuario en una sesion
  await connection.query('SELECT * FROM pos.usuario WHERE idusuario = ?',[id], function (error, results, fields) { //query para insertar el documento venta
    if (error) {
      return connection.rollback(function () {
        throw error;
      });
    }else{
      
      done(null, results[0]);
      
    }
    
  });//final de la query
});*/
module.exports.profile = (event, context, callback) =>{

  context.callbackWaitsForEmptyEventLoop = false;
  var id = [event.pathParameters.idUsuario]

  console.log(id); 

  var User = {
      idusuario: null,
      username: null,
      password: null,
      ultima_conexion: null,
      estado: null,
      idempleado: null,
      idrol: null,
      fecha_creacion: null
    }
    
    connection.query('SELECT * FROM pos.usuario WHERE idusuario = ?',[id], function (error, results, fields) { //query para insertar el documento venta
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }else{
        
        User = results[0];

        callback(null, {
          statusCode: 200,
          headers: {

            'Access-Control-Allow-Origin': '*',

            'Access-Control-Allow-Credentials': true,

          },
          body: JSON.stringify(
            User
          )
        })
        
      }
    
    
    });//final de la query
  }//Final de la funcion
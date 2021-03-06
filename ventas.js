'use strict';
const connection = require('../connection');
const queryString = require('querystring');
const Validator = require('validatorjs');


//--crear venta pos.documento_venta;, pos.detalle_documento_venta;
module.exports.findSale = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info

  var numeroVenta = [event.pathParameters.numero]

  const sql = 'SELECT * FROM pos.documento_venta where pos.documento_venta.iddocumento_venta = ?';
  const sql3 = 'SELECT * FROM pos.detalle_documento_venta where pos.detalle_documento_venta.iddocumento_venta = ?';
  //const sql3 = 'SELECT * FROM pos.detalle_producto where pos.detalle_producto.idorden = ?';
  var detalle = [];

  var data3 = {
    iddocumento_venta: null,
    idcliente: null,
    numero: null,
    fecha: null,
    idusuario: null,
    total: null,
    estado: null,
    idpago: null,
    idorden: null,
    referencia: null,
    detalle: null
  };
  var data = {};
  var data2 = {};
  connection.query(sql, numeroVenta, (error, rows) => {
    if (error) {
      callback({
        statusCode: 500,
        body: JSON.stringify(error)
      })
    } else {
      data = rows;
      console.log('informacion de la venta');
      console.log(data);

      connection.query(sql3, numeroVenta, (error, rows3) => { //Query para el detalle de productos
        if (error) {
          callback({
            statusCode: 500,
            body: JSON.stringify(error)
          })
        } else {

          try {
            console.log("Detalle de orden");
            console.log(rows3);
            /**
                   * iddocumento_venta: null,
      idcliente: null,
    numero: null,
    fecha: null,
    idusuario: null,
    total: null,
    estado: null,
    idpago: null,
    idorden: null,
    referencia: null
                   */

            data3.iddocumento_venta = rows[0].iddocumento_venta;
            data3.idcliente = rows[0].idcliente;
            data3.numero = rows[0].numero;
            data3.fecha = rows[0].fecha;
            data3.idusuario = rows[0].idusuario;
            data3.total = rows[0].total;
            data3.estado = rows[0].estado;
            data3.idpago = rows[0].idpago;
            data3.idorden = rows[0].idorden;
            data3.referencia = rows[0].referencia;
            data3.detalle = rows3;


            callback(null, { //inicio rows
              statusCode: 200,
              headers: {

                'Access-Control-Allow-Origin': '*',

                'Access-Control-Allow-Credentials': true,

              },
              body: JSON.stringify(data3)
            }) //final callback
          } catch (TypeError) {
            callback(null, { //inicio rows
              statusCode: 404,
              headers: {

                'Access-Control-Allow-Origin': '*',

                'Access-Control-Allow-Credentials': true,

              },
              message: JSON.stringify({
                message: "Venta no encontrada"
              })
            }) //final callback
          }

        }


      }) //Final del detalle de productos

    } //final else
  }) //final  query


};
module.exports.sale = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
  //Para actualizar los trps que se compraron
  //UPDATE `pos`.`producto_sucursal` SET `existencia`='90' WHERE `idproducto`='1' and`idsucursal`='1';
  var existencia
  var UsuarioSucursal
  var SucursalVenta

  //---------------------------------------
  var rules = {};

  if (body.detalle != "") {
    rules = {
      idcliente: 'integer',
      numero: 'integer',
      fecha: 'required|date',
      idusuario: 'required|integer',
      total: 'required|numeric',
      estado: 'integer',
      idpago: 'integer',
      idorden: 'integer',
      idsucursal: 'required|integer',
      referencia: 'string|max:100',
      'detalle.*.idproducto': 'required|integer',
      'detalle.*.cantidad': 'integer',
      'detalle.*.precio_venta': 'required|numeric',
      'detalle.*.tipo_precio': 'required|integer',
    };
  } else if (body.detalle == "") {
    rules = {
      idcliente: 'integer',
      numero: 'integer',
      fecha: 'required|date',
      idusuario: 'required|integer',
      total: 'required|numeric',
      estado: 'integer',
      idpago: 'integer',
      idorden: 'integer',
      idsucursal: 'required|integer',
      referencia: 'string|max:100'
    }
  }
  let validation = new Validator(body, rules);
  if (validation.passes()) {
    //---------------------------------------

    var data = {
      iddocumento_venta: null,
      idcliente: body.idcliente,
      numero: body.numero,
      fecha: body.fecha,
      idusuario: body.idusuario,
      total: body.total,
      estado: body.estado,
      idpago: body.idpago,
      idorden: body.idorden,
      referencia: body.referencia,
      idsucursal: body.idsucursal
    };
    // Obteniendo todas las claves del JSON

    for (var clave in data) {
      // Controlando que json realmente tenga esa propiedad
      if (data.hasOwnProperty(clave)) {
        // Mostrando en pantalla la clave junto a su valor
        if (data[clave] == "") {
          data[clave] = null;
        }
      }
    }
    SucursalVenta =data.idsucursal;
    var datade = body.detalle;
    console.log("Estos son los productos de la compra");

    console.log(datade);


    connection.beginTransaction(function (err) {
      var idG;
      if (err) {
        throw err;
      }

     

        
        console.log("ID sucursal donde trabaja el usuario que esta haciendo la venta");
        console.log(SucursalVenta);

        if (data.idorden == null) { //Revisamos si tiene una orden vinculada, esta condicion devuelve true si no tiene orden vinculada



          if (datade == "") { //Para confirmar datos en el detalle de documento de venta venta
            callback(null, {
              statusCode: 500,
              headers: {

                'Access-Control-Allow-Origin': '*',

                'Access-Control-Allow-Credentials': true,

              },
              body: JSON.stringify({message:'No se puede ralizar la venta, no existe orden vinculada ni detalle de documento de venta'})
            })

          } else { //Insertamos la venta con los datos del detalle de documento de venta

            connection.query('SELECT * FROM pos.producto_sucursal where pos.producto_sucursal.idsucursal = ?', [SucursalVenta], function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
              if (error) {
                return connection.rollback(function () {
                  throw error;
                });
              }
              existencia = results
              console.log('Existencias que hay en la sucursal del usuario');
              console.log(existencia);

              connection.query('INSERT INTO pos.documento_venta SET ?', [data], function (error, results1, fields) { //query para insertar el documento venta
                if (error) {
                  return connection.rollback(function () {
                    throw error;
                  });
                }
                //idG es el id de documento de venta que se va a instertar
                idG = results1.insertId;
                var resta2 = []
                var nuevaExistencia = {
                  idproducto: null,
                  idsucursal: null,
                  existencia: null
                }

                let sql = datade.map(item => `(${idG},${item.idproducto}, ${item.cantidad}, ${item.precio_venta}, ${item.tipo_precio})`)

                console.log("Datos de la compra");
                console.log(datade);
                console.log("Datos de existencia");
                console.log(existencia);

                for (let index = 0; index < datade.length; index++) { //En este ciclo anidado se comprobaria existencia si no utilizamos inventario negativo
                  for (let index2 = 0; index2 < existencia.length; index2++) { //utilizar try catch
                    if (datade[index].idproducto == existencia[index2].idproducto) {
                      nuevaExistencia = {}
                      nuevaExistencia.idproducto = datade[index].idproducto
                      nuevaExistencia.idsucursal = SucursalVenta
                      nuevaExistencia.existencia = existencia[index2].existencia - datade[index].cantidad
                      resta2.push(nuevaExistencia)
                    }

                  }

                }

                console.log("Array de objetos para insertar ");
                console.log(resta2);


                //existencia... array de objetos con los campos (idproducto, idsucursal, existencia)


                console.log("valores del detalle de venta, idDocumento de venta, idproducto, cantidadComprada,Precio,TipodePrecio");
                console.log(sql);
                const finalQuery = "INSERT INTO pos.detalle_documento_venta (iddocumento_venta,idproducto, cantidad, precio_venta, tipo_precio) VALUES " + sql

                console.log(finalQuery)
                //console.log("query("+finalQuery+")")

                connection.query(finalQuery, function (error, results2, fields) { //query para insertar el detalle de producto vendido
                  if (error) {
                    return connection.rollback(function () {
                      throw error;
                    });
                  }
                  //--------------------------------------------- query para eliminar existencias viejas
                  //DELETE FROM pos.producto_sucursal WHERE pos.producto_sucursal.idproducto IN (1,2,3) and pos.producto_sucursal.idsucursal = 2;
                  let sqlDelete = resta2.map(item => `(${item.idproducto})`)
                  var queryDeleteProductoSucursal = "DELETE FROM pos.producto_sucursal WHERE pos.producto_sucursal.idproducto IN (" + sqlDelete + ") and pos.producto_sucursal.idsucursal = ?";
                  //console.log(queryDeleteProductoSucursal);
                  console.log("ID's para elmininar");
                  console.log(sqlDelete);
                  console.log("Query completa");
                  console.log(queryDeleteProductoSucursal);

                  connection.query(queryDeleteProductoSucursal, [SucursalVenta], function (error, results, fields) { //query para eliminar las existencias viejas
                    if (error) {
                      return connection.rollback(function () {
                        throw error;
                      });
                    }

                    let sqlX = resta2.map(item => `(${item.idproducto},${item.idsucursal}, ${item.existencia})`)
                    const finalQueryX = "INSERT INTO pos.producto_sucursal (idproducto,idsucursal,existencia) VALUES " + sqlX
                    //--------------------------------------------------------------------------------------------------------------------------------------------------------------
                    connection.query(finalQueryX, function (error, results, fields) { //query para insertar las nuevas existencias del inventario de la sucursal
                      if (error) {
                        return connection.rollback(function () {
                          throw error;
                        });
                      }
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
                              message: 'Venta realizada correctamente, unicamente con el detalle del documento de venta',
                              id: idG
                            })
                          })
                        }
                      }); //Fin commit
                    }); //fin del query para el update de las existencias
                  }); //fin del query para eliminar las existencias viejas
                }); //fin del query para el detalle de orden
              }); //final query principal insertar documento de venta
            }) //Final de la Query para las existencias de la sucursal


          } //Final del else que verifica si existe detalle de documento de venta
        } //final del if para verificar si existe una orden vinculada o no
        else { //Else para trabajar con ordenes vinculadas
          connection.query('SELECT estado FROM pos.orden WHERE pos.orden.idorden = ?', [data.idorden], function (error, results100, fields) { //query para ontener el producto de la orden
            if (error) {
              return connection.rollback(function () {
                throw error;
              });
            }

            if (results100[0].estado == 1) { //if para verificar que la orden esta activa
              //no se podra vender si es una orden ya facturada o una orden cancelada



              connection.query('SELECT * FROM pos.detalle_producto WHERE pos.detalle_producto.idorden = ?', [data.idorden], function (error, results10, fields) { //query para ontener el producto de la orden
                if (error) {
                  return connection.rollback(function () {
                    throw error;
                  });
                }
                //Orden sin detalle de orden 77
                //Orden sin detalle de producto 78
                var productosOrden = results10;
                console.log("Informacion de la orden");
                console.log(productosOrden); //Consultar el detalle de producto de una orden
                if (productosOrden == "") { //Para las ordenes sin productos
                  console.log("Orden sin detalle de productos");

                  if (datade == "") { //Para las ordenes vinculadas sin productos y los documentos de ventas sin productos caso de venta de servicio
                    data.estado = 2;
                    connection.query('INSERT INTO pos.documento_venta SET ?', [data], function (error, results1, fields) { //query para insertar el documento venta
                      if (error) {
                        return connection.rollback(function () {
                          throw error;
                        });
                      }
                      idG = results1.insertId;
                      connection.query('UPDATE pos.orden SET estado = 2 WHERE idorden = ?', [data.idorden], function (error, results2, fields) { //query para actualizar a facturada la orden
                        if (error) {
                          return connection.rollback(function () {
                            throw error;
                          });
                        }

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
                                message: 'Venta realizada correctamente, unicamente servicios',
                                id: idG
                              })
                            })
                          }
                        }); //Fin commit

                      }) //final de la query para actualizar el estado de la orden
                    }) //final de la query para insertar el documento de venta
                  } //final de la condicional para saber que el detalle de doc venta tiene productos dentro de la condicional del detalle de productos de la orden
                  else { //else para cuando el documento de ventas tenga producto dentro de la condicional de productos en el detalle de la orden
                    //descontar los productos del detalle del documento de venta

                    connection.query('SELECT * FROM pos.producto_sucursal where pos.producto_sucursal.idsucursal = ?', [SucursalVenta], function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
                      if (error) {
                        return connection.rollback(function () {
                          throw error;
                        });
                      }
                      existencia = results
                      console.log('Existencias que hay en la sucursal del usuario');
                      console.log(existencia);
                      data.estado = 2;
                      connection.query('INSERT INTO pos.documento_venta SET ?', [data], function (error, results1, fields) { //query para insertar el documento venta
                        if (error) {
                          return connection.rollback(function () {
                            throw error;
                          });
                        }
                        //idG es el id de documento de venta que se va a instertar
                        idG = results1.insertId;
                        var resta2 = []
                        var nuevaExistencia = {
                          idproducto: null,
                          idsucursal: null,
                          existencia: null
                        }

                        let sql = datade.map(item => `(${idG},${item.idproducto}, ${item.cantidad}, ${item.precio_venta}, ${item.tipo_precio})`)

                        console.log("Datos de la compra");
                        console.log(datade);
                        console.log("Datos de existencia");
                        console.log(existencia);

                        for (let index = 0; index < datade.length; index++) { //En este ciclo anidado se comprobaria existencia si no utilizamos inventario negativo
                          for (let index2 = 0; index2 < existencia.length; index2++) { //utilizar try catch
                            if (datade[index].idproducto == existencia[index2].idproducto) {
                              nuevaExistencia = {}
                              nuevaExistencia.idproducto = datade[index].idproducto
                              nuevaExistencia.idsucursal = SucursalVenta
                              nuevaExistencia.existencia = existencia[index2].existencia - datade[index].cantidad
                              resta2.push(nuevaExistencia)
                            }

                          }

                        }

                        console.log("Array de objetos para insertar ");
                        console.log(resta2);


                        //existencia... array de objetos con los campos (idproducto, idsucursal, existencia)


                        console.log("valores del detalle de venta, idDocumento de venta, idproducto, cantidadComprada,Precio,TipodePrecio");
                        console.log(sql);
                        const finalQuery = "INSERT INTO pos.detalle_documento_venta (iddocumento_venta,idproducto, cantidad, precio_venta, tipo_precio) VALUES " + sql

                        console.log(finalQuery)
                        //console.log("query("+finalQuery+")")

                        connection.query(finalQuery, function (error, results2, fields) { //query para insertar el detalle de producto vendido
                          if (error) {
                            return connection.rollback(function () {
                              throw error;
                            });
                          }
                          //--------------------------------------------- query para eliminar existencias viejas
                          //DELETE FROM pos.producto_sucursal WHERE pos.producto_sucursal.idproducto IN (1,2,3) and pos.producto_sucursal.idsucursal = 2;
                          let sqlDelete = resta2.map(item => `(${item.idproducto})`)
                          var queryDeleteProductoSucursal = "DELETE FROM pos.producto_sucursal WHERE pos.producto_sucursal.idproducto IN (" + sqlDelete + ") and pos.producto_sucursal.idsucursal = ?";
                          //console.log(queryDeleteProductoSucursal);
                          console.log("ID's para elmininar");
                          console.log(sqlDelete);
                          console.log("Query completa");
                          console.log(queryDeleteProductoSucursal);

                          connection.query(queryDeleteProductoSucursal, [SucursalVenta], function (error, results, fields) { //query para eliminar las existencias viejas
                            if (error) {
                              return connection.rollback(function () {
                                throw error;
                              });
                            }

                            let sqlX = resta2.map(item => `(${item.idproducto},${item.idsucursal}, ${item.existencia})`)
                            const finalQueryX = "INSERT INTO pos.producto_sucursal (idproducto,idsucursal,existencia) VALUES " + sqlX
                            //--------------------------------------------------------------------------------------------------------------------------------------------------------------
                            connection.query(finalQueryX, function (error, results, fields) { //query para insertar las nuevas existencias del inventario de la sucursal
                              if (error) {
                                return connection.rollback(function () {
                                  throw error;
                                });
                              }
                              connection.query('UPDATE pos.orden SET estado = 2 WHERE idorden = ?', [data.idorden], function (error, results2, fields) { //query para actualizar a facturada la orden
                                if (error) {
                                  return connection.rollback(function () {
                                    throw error;
                                  });
                                }

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
                                        message: 'Venta realizada correctamente, descontando del inventario el detalle del documento de ventas',
                                        id: idG
                                      })
                                    })
                                  }
                                }); //Fin commit
                              }) //final para la query que actualiza la orden
                            }); //fin del query para el update de las existencias
                          }); //fin del query para eliminar las existencias viejas
                        }); //fin del query para el detalle de orden
                      }); //final query principal insertar documento de venta
                    }) //Final de la Query para las existencias de la sucursal

                  }

                } //fin de la condicional para saber si tiene productos el detalle de productos
                else { //else para trabajar con detalle de productos en la orden
                  //productosOrden
                  if (datade == "") { //para insertar la venta solo con los productos del detalle de la orden
                    //productosOrden
                    connection.query('SELECT * FROM pos.producto_sucursal where pos.producto_sucursal.idsucursal = ?', [SucursalVenta], function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
                      if (error) {
                        return connection.rollback(function () {
                          throw error;
                        });
                      }
                      existencia = results
                      console.log('Existencias que hay en la sucursal del usuario');
                      console.log(existencia);
                      data.estado = 2;

                      connection.query('INSERT INTO pos.documento_venta SET ?', [data], function (error, results1, fields) { //query para insertar el documento venta
                        if (error) {
                          return connection.rollback(function () {
                            throw error;
                          });
                        }

                        idG = results1.insertId;
                        var resta2 = []
                        var nuevaExistencia = {
                          idproducto: null,
                          idsucursal: null,
                          existencia: null
                        }

                        let sql = productosOrden.map(item => `(${item.idorden},${item.idproducto}, ${item.cantidad}, ${item.precio_venta}, ${item.tipo_precio})`)

                        console.log("Datos de la compra, de la orden");
                        console.log(sql);
                        console.log("Datos de existencia");
                        console.log(existencia);

                        for (let index = 0; index < productosOrden.length; index++) { //En este ciclo anidado se comprobaria existencia si no utilizamos inventario negativo
                          for (let index2 = 0; index2 < existencia.length; index2++) { //utilizar try catch
                            if (productosOrden[index].idproducto == existencia[index2].idproducto) {
                              nuevaExistencia = {}
                              nuevaExistencia.idproducto = productosOrden[index].idproducto
                              nuevaExistencia.idsucursal = SucursalVenta
                              nuevaExistencia.existencia = existencia[index2].existencia - productosOrden[index].cantidad
                              resta2.push(nuevaExistencia)
                            }

                          }

                        }

                        console.log("Array de objetos para insertar ");
                        console.log(resta2);


                        connection.query('UPDATE pos.orden SET estado = 2 WHERE idorden = ?', [data.idorden], function (error, results2, fields) { //query para actualizar a facturada la orden
                          if (error) {
                            return connection.rollback(function () {
                              throw error;
                            });
                          }
                          //--------------------------------------------- query para eliminar existencias viejas
                          //DELETE FROM pos.producto_sucursal WHERE pos.producto_sucursal.idproducto IN (1,2,3) and pos.producto_sucursal.idsucursal = 2;
                          let sqlDelete = resta2.map(item => `(${item.idproducto})`)
                          var queryDeleteProductoSucursal = "DELETE FROM pos.producto_sucursal WHERE pos.producto_sucursal.idproducto IN (" + sqlDelete + ") and pos.producto_sucursal.idsucursal = ?";
                          //console.log(queryDeleteProductoSucursal);
                          console.log("ID's para elmininar");
                          console.log(sqlDelete);
                          console.log("Query completa");
                          console.log(queryDeleteProductoSucursal);



                          connection.query(queryDeleteProductoSucursal, [SucursalVenta], function (error, results, fields) { //query para eliminar las existencias viejas
                            if (error) {
                              return connection.rollback(function () {
                                throw error;
                              });
                            }

                            let sqlX = resta2.map(item => `(${item.idproducto},${item.idsucursal}, ${item.existencia})`)
                            const finalQueryX = "INSERT INTO pos.producto_sucursal (idproducto,idsucursal,existencia) VALUES " + sqlX
                            //--------------------------------------------------------------------------------------------------------------------------------------------------------------
                            connection.query(finalQueryX, function (error, results, fields) { //query para insertar las nuevas existencias del inventario de la sucursal
                              if (error) {
                                return connection.rollback(function () {
                                  throw error;
                                });
                              }
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
                                      message: 'Venta realizada correctamente, sin detalle del doc. venta unicamente con el detalle de producto de la orden',
                                      id: idG
                                    })
                                  })
                                }
                              }); //Fin commit
                            }); //fin del query para el update de las existencias
                          }); //fin del query para eliminar las existencias viejas
                        }); //fin del query para actualzar a facturado


                      }) //Final de la query para insertar el documento de venta
                    }) //final de la query para obtener las existencias

                  } else { //Para insertar la venta descontando los productos del detalle de documento de venta y el detalle de producto de la orden
                    connection.query('SELECT * FROM pos.producto_sucursal where pos.producto_sucursal.idsucursal = ?', [SucursalVenta], function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
                      if (error) {
                        return connection.rollback(function () {
                          throw error;
                        });
                      }
                      existencia = results
                      console.log('Existencias que hay en la sucursal del usuario');
                      console.log(existencia);
                      data.estado = 2;

                      connection.query('INSERT INTO pos.documento_venta SET ?', [data], function (error, results1, fields) { //query para insertar el documento venta
                        if (error) {
                          return connection.rollback(function () {
                            throw error;
                          });
                        }
                        //logica para sumar los productos similares en detalle de doc. venta y detalle producto de orden
                        idG = results1.insertId;
                        var productoTotal = [];
                        var resta2 = []
                        var nuevaExistencia = {
                          idproducto: null,
                          idsucursal: null,
                          existencia: null
                        }
                        let sql2 = datade.map(item => `(${idG},${item.idproducto}, ${item.cantidad}, ${item.precio_venta}, ${item.tipo_precio})`)

                        let sql = productosOrden.map(item => `(${item.idorden},${item.idproducto}, ${item.cantidad}, ${item.precio_venta}, ${item.tipo_precio})`)

                        console.log("Datos de compra, doc. venta");
                        console.log(sql2);
                        console.log("Datos de compra, orden");
                        console.log(sql);


                        productoTotal = datade.concat(productosOrden);


                        /*for (let index = 0; index < datade.length; index++) {
                          for (let index2 = 0; index2 < productosOrden.length; index2++) {
                           if (datade[index].idproducto != productosOrden[index2].idproducto) {

                             productoTotal.push(productosOrden[index2]);
                           }
                          }
                        }*/
                        let index
                        let index2

                        for (index = 0; index < productoTotal.length; index++) {//for para agrupar los datos de compra
                          for (index2 = index + 1; index2 < productoTotal.length; index2++) {
                            if (productoTotal[index].idproducto == productoTotal[index2].idproducto) {
                              productoTotal[index].cantidad = productoTotal[index].cantidad + productoTotal[index2].cantidad
                              productoTotal.splice(index2, 1);
                            }

                          }
                        }


                        console.log('Estos son los dos arrays de productos convinados');
                        console.log(productoTotal);


                        for (let index = 0; index < productoTotal.length; index++) { //En este ciclo anidado se comprobaria existencia si no utilizamos inventario negativo
                          for (let index2 = 0; index2 < existencia.length; index2++) { //utilizar try catch
                            if (productoTotal[index].idproducto == existencia[index2].idproducto) {
                              nuevaExistencia = {}
                              nuevaExistencia.idproducto = productoTotal[index].idproducto
                              nuevaExistencia.idsucursal = SucursalVenta
                              nuevaExistencia.existencia = existencia[index2].existencia - productoTotal[index].cantidad
                              resta2.push(nuevaExistencia)
                            }

                          }

                        }
                        console.log("Datos de existencia");
                        console.log(existencia);
                        console.log("Array de objetos para insertar ");
                        console.log(resta2);

                        //query para insertar el detalle de documento de venta
                        const finalQuery1 = "INSERT INTO pos.detalle_documento_venta (iddocumento_venta,idproducto, cantidad, precio_venta, tipo_precio) VALUES " + sql2


                        console.log(finalQuery1)
                        //console.log("query("+finalQuery+")")

                        connection.query(finalQuery1, function (error, results2, fields) { //query para insertar el detalle de producto vendido
                          if (error) {
                            return connection.rollback(function () {
                              throw error;
                            });
                          }
                          connection.query('UPDATE pos.orden SET estado = 2 WHERE idorden = ?', [data.idorden], function (error, results2, fields) { //query para actualizar a facturada la orden
                            if (error) {
                              return connection.rollback(function () {
                                throw error;
                              });
                            }
                            //logica para verificar o sumar los productos de cada detalle
                            //--------------------------------------------- query para eliminar existencias viejas
                            //DELETE FROM pos.producto_sucursal WHERE pos.producto_sucursal.idproducto IN (1,2,3) and pos.producto_sucursal.idsucursal = 2;
                            let sqlDelete = resta2.map(item => `(${item.idproducto})`)
                            var queryDeleteProductoSucursal = "DELETE FROM pos.producto_sucursal WHERE pos.producto_sucursal.idproducto IN (" + sqlDelete + ") and pos.producto_sucursal.idsucursal = ?";
                            //console.log(queryDeleteProductoSucursal);
                            console.log("ID's para elmininar");
                            console.log(sqlDelete);
                            console.log("Query completa");
                            console.log(queryDeleteProductoSucursal);



                            connection.query(queryDeleteProductoSucursal, [SucursalVenta], function (error, results, fields) { //query para eliminar las existencias viejas
                              if (error) {
                                return connection.rollback(function () {
                                  throw error;
                                });
                              }

                              let sqlX = resta2.map(item => `(${item.idproducto},${item.idsucursal}, ${item.existencia})`)
                              const finalQueryX = "INSERT INTO pos.producto_sucursal (idproducto,idsucursal,existencia) VALUES " + sqlX
                              //--------------------------------------------------------------------------------------------------------------------------------------------------------------
                              connection.query(finalQueryX, function (error, results, fields) { //query para insertar las nuevas existencias del inventario de la sucursal
                                if (error) {
                                  return connection.rollback(function () {
                                    throw error;
                                  });
                                }

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
                                        message: 'Venta realizada correctamente, descontando el producto de ambos detalles',
                                        id: idG
                                      })
                                    })
                                  }
                                }); //Fin commit
                              }); //fin del query para el update de las existencias
                            }); //fin del query para eliminar las existencias viejas
                          }); //fin del query para actualzar a facturado
                        }); //final de la query para insertar el detalle de venta

                      }) //Final de la query para insertar el documento de venta
                    }) //final de la query para obtener las existencias
                  }
                }
              })
            } // final del if para verificar que la orden esta activa
            else {
              callback(null, {
                statusCode: 500,
                headers: {

                  'Access-Control-Allow-Origin': '*',

                  'Access-Control-Allow-Credentials': true,

                },
                body: JSON.stringify({
                  message: 'No se puede realizar la venta con una orden facturada o cancelada'
                })
              })
            }
          }) //final de la query para saber si la orden esta cancelada, activa o facturada
        } //else para trabajar con ordenes vinculadas

    }); //final begin transaction
  } //final del if para la validacion
  else {
    callback(null, {
      statusCode: 500,
      headers: {

        'Access-Control-Allow-Origin': '*',

        'Access-Control-Allow-Credentials': true,

      },
      body: JSON.stringify({
        message: 'Datos no validos'
      })
    })
  }

}; //final de la funcion
//--fin realizar venta
module.exports.shop = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
  
  var existencia
  //---------------------------------------------
  var rules = {
    numero: 'required|integer',
    serie: 'required|string|max:45',
    fecha: 'required|date',
    idproveedor: 'required|integer',
    total: 'numeric',
    idusuario: 'required|integer',
    idsucursal: 'required|integer',
    'detalle.*.idproducto': 'required|integer',
    'detalle.*.cantidad': 'integer',
    'detalle.*.precio_compra': 'required|numeric',
  };


  let validation = new Validator(body, rules);
  if (validation.passes() && body.detalle != "") {
    //---------------------------------------------

    var data = {
      idfactura_compra: null,
      numero: body.numero,
      serie: body.serie,
      fecha: body.fecha,
      idproveedor: body.idproveedor,
      total: body.total,
      estado: 1,
      idusuario: body.idusuario,
      idsucursal: body.idsucursal
    };
    // Obteniendo todas las claves del JSON

    for (var clave in data) {
      // Controlando que json realmente tenga esa propiedad
      if (data.hasOwnProperty(clave)) {
        // Mostrando en pantalla la clave junto a su valor
        if (data[clave] == "") {
          data[clave] = null;
        }
      }
    }

    var datade = body.detalle;
    var Sucursal = body.idsucursal;

    console.log("Detalle de productos para agregar");
    console.log(datade);



    connection.beginTransaction(function (err) {
      var idG;
      if (err) {
        throw err;
      }
      connection.query('INSERT INTO pos.factura_compra SET ?', [data], function (error, results, fields) { //insertar la factura de compra
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }

        idG = results.insertId;

        let sql = datade.map(item => `(${idG},${item.idproducto}, ${item.cantidad}, ${item.precio_compra})`)
        //array with items.
        //console.log(sql);
        const finalQuery = "INSERT INTO pos.detalle_factura_compra (idfactura_compra,idproducto,cantidad, precio_compra) VALUES " + sql
        //console.log(finalQuery)
        //console.log("query("+finalQuery+")")
        
        connection.query(finalQuery, function (error, results, fields) { //para ingresar el detalle de compra
          if (error) {
            return connection.rollback(function () {
              throw error;
            });
          }



          connection.query('SELECT * FROM pos.producto_sucursal where pos.producto_sucursal.idsucursal = ?', [Sucursal], function (error, results, fields) { //query para obtener la existencias 
            if (error) {
              return connection.rollback(function () {
                throw error;
              });
            }
            existencia = results;


            var suma = []
            var nuevaExistencia = {
              idproducto: null,
              idsucursal: null,
              existencia: null
            }


            console.log("Datos de la compra");
            console.log(datade);
            console.log("Datos de existencia");
            console.log(existencia);

            for (let index = 0; index < datade.length; index++) { //En este ciclo anidado se comprobaria existencia si no utilizamos inventario negativo
              for (let index2 = 0; index2 < existencia.length; index2++) { //utilizar try catch
                if (datade[index].idproducto == existencia[index2].idproducto) {
                  nuevaExistencia = {}
                  nuevaExistencia.idproducto = datade[index].idproducto
                  nuevaExistencia.idsucursal = Sucursal
                  nuevaExistencia.existencia = existencia[index2].existencia + datade[index].cantidad
                  suma.push(nuevaExistencia)
                }

              }

            }

            console.log("Array de objetos para insertar ");
            console.log(suma);
//Error del bug cuando se quiere eliminar prodcuto que no existe, la existencia es suma
          if (suma != "") {
            let sqlDelete = suma.map(item => `(${item.idproducto})`)
            var queryDeleteProductoSucursal = "DELETE FROM pos.producto_sucursal WHERE pos.producto_sucursal.idproducto IN (" + sqlDelete + ") and pos.producto_sucursal.idsucursal = ?";
            console.log("ID's para elmininar");
            console.log(sqlDelete);
            console.log("Query completa");
            console.log(queryDeleteProductoSucursal);

            connection.query(queryDeleteProductoSucursal, [Sucursal], function (error, results, fields) { //para eliminar los productos que se van a actualizar
              if (error) {
                return connection.rollback(function () {
                  throw error;
                });
              }

              let sqlX = suma.map(item => `(${item.idproducto},${item.idsucursal}, ${item.existencia})`)
              const finalQueryX = "INSERT INTO pos.producto_sucursal (idproducto,idsucursal,existencia) VALUES " + sqlX

              connection.query(finalQueryX, function (error, results, fields) { //para sumar los productos al inventario
                if (error) {
                  return connection.rollback(function () {
                    throw error;
                  });
                }

                connection.commit(function (err) {
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
                        message: 'factura de compra y detalles insertados correctamente',
                        id: idG
                      })
                    })
                  }
                }); //Fin commit
              }); //fin para sumar los productos al inventario
            }); //fin para eliminar los productos viejos
          }//fin del if para inexistencias 
          else{
            //[Sucursal]
            let sqlX = datade.map(item => `(${item.idproducto},${Sucursal}, ${item.cantidad})`)
              const finalQueryX = "INSERT INTO pos.producto_sucursal (idproducto,idsucursal,existencia) VALUES " + sqlX

              connection.query(finalQueryX, function (error, results, fields) { //para sumar los productos al inventario
                if (error) {
                  return connection.rollback(function () {
                    throw error;
                  });
                }

                connection.commit(function (err) {
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
                        message: 'factura de compra y detalles insertados correctamente',
                        id: idG
                      })
                    })
                  }
                }); //Fin commit
              }); //fin para sumar los productos al inventario
          }
            
          }); //fin para obtener las existencias de la sucursal
          
        }); //fin del query para el detalle de compra
      
      }); //final query principal
    }); //final begin transaction
  } //final del if para la validacion
  else {
    callback(null, {
      statusCode: 500,
      headers: {

        'Access-Control-Allow-Origin': '*',

        'Access-Control-Allow-Credentials': true,

      },
      body: JSON.stringify({
        message: 'Datos no validos o no existe detalle de compra'
      })
    })
  }

}; //final de la funcion

module.exports.cancelSale = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);

  var existencia;
  var UsuarioSucursal;
  var SucursalVenta;
  
  var numeroVenta = body.id;
  //console.log(body);
  var detalle_venta;
  var detalle_orden;

  var data_compra = {
    idfactura_compra: null,
    numero: null,
    serie: null,
    fecha: null,
    idproveedor: null,
    total: null,
    idusuario: null,
    idsucursal: null
  };


  var data_venta = {
    iddocumento_venta: null,
    idcliente: null,
    numero: null,
    fecha: null,
    idusuario: null,
    total: null,
    estado: null,
    idpago: null,
    idorden: null,
    referencia: null
  };


  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }

    // para verifical sucursal de venta y de donde es el usuario
    if (body.tipo == 2) { //para las cancelaciones de ventas
      connection.query('SELECT * from pos.documento_venta WHERE iddocumento_venta=?', [numeroVenta], function (error, results, fields) { //query para determinar la sucursal del usuario
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }
        data_venta = results[0];
        
        if (results == "") { //para verificar que existe el documento de venta
          connection.commit(function (err) {
            console.log("Mensaje desde el commit");
            if (err) {
              return connection.rollback(function () {
                throw err;
              });
            } else {
              callback(null, {
                statusCode: 400,
                headers: {

                  'Access-Control-Allow-Origin': '*',

                  'Access-Control-Allow-Credentials': true,

                },
                body: JSON.stringify({
                  message: 'No existe la venta buscada'
                })
              })
            }
          }); //Fin commit
        }else if (data_venta.estado == 3) {//si el documento de venta esta cancelado agregar or para las compras
          connection.commit(function (err) {
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
                  message: 'El documento de venta ya fue cancelado, no es posible volver a cancelar'
                })
              })
            }
          }); //Fin commit
          
        }
        else { // Si existe el documento de venta entonces
          SucursalVenta = data_venta.idsucursal;
                  //hacer el update de que esta cancelada a venta
            console.log("ID sucursal donde trabaja el usuario que esta haciendo la venta");
            console.log(SucursalVenta);

            console.log("Datos de la venta");
            console.log(data_venta);
            
            connection.query('UPDATE pos.documento_venta SET estado = 3 WHERE iddocumento_venta = ?', [numeroVenta], function (error, results2, fields) { //query para actualizar a facturada la orden
              if (error) {
                return connection.rollback(function () {
                  throw error;
                });
              }
              
            //armar los datos para realizar la consulta para obtener solo los productos que estan pidiendo
            //let sqlDelete = resta2.map(item => `(${item.idproducto})`);
            //var queryDeleteProductoSucursal = "SELECT * FROM pos.producto_sucursal WHERE idproducto IN (" + sqlDelete + ") and pos.producto_sucursal.idsucursal = ?";
            
              if (data_venta.idorden == null) { //codigo para reintegrar unicamente el detalle de doc. venta
                console.log(numeroVenta);
                connection.query('SELECT * from pos.detalle_documento_venta WHERE iddocumento_venta=?', [numeroVenta], function (error, results, fields) { //query para obtener los detalles del doc. de venta
                  if (error) {
                    return connection.rollback(function () {
                      throw error;
                    });
                  }
                  detalle_venta = results;
                  //var id_productos_vendidos = [];
                  
                  /*  
                  for (let index = 0; index < detalle_venta.length; index++) {
                    id_productos_vendidos.push(detalle_venta[index].idproducto);                  
                  }*/

                  //console.log(id_productos_vendidos);// productos a consultar por existencia
                  let sqlIds = detalle_venta.map(item => `(${item.idproducto})`);
                  console.log(sqlIds);
                  var existenciasProductoSucursal = "SELECT * FROM pos.producto_sucursal WHERE idproducto IN (" + sqlIds + ") and idsucursal = ?";
                  connection.query(existenciasProductoSucursal, [SucursalVenta], function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
                    if (error) {
                      return connection.rollback(function () {
                        throw error;
                      });
                    }
                    console.log("Detalle de doc. venta");
                    console.log(detalle_venta);
                    existencia = results
                    console.log('Existencias que hay de los productos vendidos en la sucursal del usuario');
                    console.log(existencia);
                    var suma = [];
                    var nuevaExistencia = {}
                    //-----------------------para agragar las nuevas eistencias
                    for (let index = 0; index < detalle_venta.length; index++) { //En este ciclo anidado se comprobaria existencia si no utilizamos inventario negativo
                      for (let index2 = 0; index2 < existencia.length; index2++) { //utilizar try catch
                        if (detalle_venta[index].idproducto == existencia[index2].idproducto) {
                          nuevaExistencia = {}
                          nuevaExistencia.idproducto = detalle_venta[index].idproducto
                          nuevaExistencia.idsucursal = SucursalVenta
                          nuevaExistencia.existencia = existencia[index2].existencia + detalle_venta[index].cantidad
                          suma.push(nuevaExistencia)
                        }
                      }
                    }
                    console.log(suma);
                    //-----------------------------insertar las nuevas existencias
                    
                    //------------------------------------------------------------
                 let sqlAct = suma.map(item => `(${item.idproducto},${item.idsucursal},${item.existencia})`);
                 var queryActualizarInventario = "INSERT INTO pos.producto_sucursal (idproducto, idsucursal, existencia) VALUES"+sqlAct+"ON DUPLICATE KEY UPDATE existencia=VALUES(existencia)"
                 console.log(sqlAct);
                 console.log(queryActualizarInventario);

                 connection.query(queryActualizarInventario, function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
                  if (error) {
                    return connection.rollback(function () {
                      throw error;
                    });
                  }
                  
                  connection.commit(function (err) {
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
                          message: 'Caso 0 de reintegracion del detalle de documentos de venta',
                          Id: data_venta.iddocumento_venta
                        })
                      })
                    }
                  }); //Fin commit
                });//Final de la query para insertar nuevas existencias
                }); //final de la query para obtener la existencia en la sucursal
                }); // final de la query para obtener los productos del detalle de venta
              } // final de la verificacion de que no tiene orden vinculada
              else{//Else para trabajar con documentos de venta con ordenes vinculadas
                //consultar los detalles de orden de la orden vinculada
                //
                                  
                 
                connection.query('UPDATE pos.orden SET estado = 3 WHERE idorden = ?', [data_venta.idorden], function (error, results2, fields) { //query para actualizar a facturada la orden
                  if (error) {
                    return connection.rollback(function () {
                      throw error;
                    });
                  }
                connection.query('SELECT * FROM pos.detalle_producto WHERE pos.detalle_producto.idorden = ?', [data_venta.idorden], function (error, results10, fields) { //query para ontener el producto de la orden
                  if (error) {
                    return connection.rollback(function () {
                      throw error;
                    });
                  }
                  detalle_orden = results10;
                  console.log("Detalle de orden");
                  console.log(detalle_orden);

                  if (detalle_orden == "") {// si la orden vinculada no tiene productos
                    //Query para ver si tiene productos el detalle del doc venta
                    connection.query('SELECT * FROM pos.detalle_documento_venta WHERE iddocumento_venta = ?', [data_venta.iddocumento_venta], function (error, results101, fields) { //query para ontener el producto de la orden
                      if (error) {
                        return connection.rollback(function () {
                          throw error;
                        });
                      }
                      detalle_venta =results101;
                      console.log("Detalle documento de venta");
                      console.log(detalle_venta);

                      if (detalle_venta == "") {
                        
                          
                          connection.commit(function (err) {
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
                                  message: 'Caso 1 de cancelacion de venta sin reintegracion de productos, documento cancelado :',
                                  Id: data_venta.iddocumento_venta
                                  
                                })
                              })
                            }
                          }); //Fin commit
                          
                       
                        
                      }//Final de la comprobacion del detalle de venta
                      else{//caso de venta de servicios con producto en el detalle documento de venta
                        connection.query('SELECT * from pos.detalle_documento_venta WHERE iddocumento_venta=?', [numeroVenta], function (error, results, fields) { //query para obtener los detalles del doc. de venta
                          if (error) {
                            return connection.rollback(function () {
                              throw error;
                            });
                          }
                          detalle_venta = results;
                          //var id_productos_vendidos = [];
                          
                          /*  
                          for (let index = 0; index < detalle_venta.length; index++) {
                            id_productos_vendidos.push(detalle_venta[index].idproducto);                  
                          }*/
        
                          //console.log(id_productos_vendidos);// productos a consultar por existencia
                          let sqlIds = detalle_venta.map(item => `(${item.idproducto})`);
                          console.log(sqlIds);
                          var existenciasProductoSucursal = "SELECT * FROM pos.producto_sucursal WHERE idproducto IN (" + sqlIds + ") and idsucursal = ?";
                          connection.query(existenciasProductoSucursal, [SucursalVenta], function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
                            if (error) {
                              return connection.rollback(function () {
                                throw error;
                              });
                            }
                            console.log("Detalle de doc. venta");
                            console.log(detalle_venta);
                            existencia = results
                            console.log('Existencias que hay de los productos vendidos en la sucursal del usuario');
                            console.log(existencia);
                            var suma = [];
                            var nuevaExistencia = {}
                            //-----------------------para agragar las nuevas eistencias
                            for (let index = 0; index < detalle_venta.length; index++) { //En este ciclo anidado se comprobaria existencia si no utilizamos inventario negativo
                              for (let index2 = 0; index2 < existencia.length; index2++) { //utilizar try catch
                                if (detalle_venta[index].idproducto == existencia[index2].idproducto) {
                                  nuevaExistencia = {}
                                  nuevaExistencia.idproducto = detalle_venta[index].idproducto
                                  nuevaExistencia.idsucursal = SucursalVenta
                                  nuevaExistencia.existencia = existencia[index2].existencia + detalle_venta[index].cantidad
                                  suma.push(nuevaExistencia)
                                }
                              }
                            }
                            console.log(suma);
                            //-----------------------------insertar las nuevas existencias
                            
                            //------------------------------------------------------------
                         let sqlAct = suma.map(item => `(${item.idproducto},${item.idsucursal},${item.existencia})`);
                         var queryActualizarInventario = "INSERT INTO pos.producto_sucursal (idproducto, idsucursal, existencia) VALUES"+sqlAct+"ON DUPLICATE KEY UPDATE existencia=VALUES(existencia)"
                         console.log(sqlAct);
                         console.log(queryActualizarInventario);
        
                         connection.query(queryActualizarInventario, function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
                          if (error) {
                            return connection.rollback(function () {
                              throw error;
                            });
                          }
                          
                          connection.commit(function (err) {
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
                                  message: 'Caso 2 cancelacion de venta de servicios con reintegracion del detalle de documentos de venta',
                                  Id: data_venta.iddocumento_venta
                                })
                              })
                            }
                          }); //Fin commit
                        });//Final de la query para insertar nuevas existencias
                        }); //final de la query para obtener la existencia en la sucursal
                        }); // final de la query para obtener los productos del detalle de venta
                      }//Fin caso de venta de servicios con producto en el detalle documento de venta

                    });//Final de la query para ver si tiene productos el detalle del doc venta
                  }// Fin si la orden vinculada no tiene productos
                  else{//para el caso de orden vinculada con prodcutos en la orden
                    connection.query('SELECT * FROM pos.detalle_documento_venta WHERE iddocumento_venta = ?', [data_venta.iddocumento_venta], function (error, results101, fields) { //query para ontener el producto de la orden
                      if (error) {
                        return connection.rollback(function () {
                          throw error;
                        });
                      }
                      
                      detalle_venta =results101;
                      console.log("Detalle documento de venta");
                      console.log(detalle_venta);

                      if (detalle_venta == "") {//si el detalle de doc.venta no tiene productos caso 4
                        //detalle_orden
                        let sqlIds = detalle_orden.map(item => `(${item.idproducto})`);
                          console.log(sqlIds);
                          var existenciasProductoSucursal = "SELECT * FROM pos.producto_sucursal WHERE idproducto IN (" + sqlIds + ") and idsucursal = ?";
                          connection.query(existenciasProductoSucursal, [SucursalVenta], function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
                            if (error) {
                              return connection.rollback(function () {
                                throw error;
                              });
                            }
                            console.log("Detalle de orden");
                            console.log(detalle_orden);
                            existencia = results
                            console.log('Existencias que hay de los productos vendidos en la sucursal del usuario');
                            console.log(existencia);
                            var suma = [];
                            var nuevaExistencia = {}
                            //-----------------------para agragar las nuevas eistencias
                            for (let index = 0; index < detalle_orden.length; index++) { //En este ciclo anidado se comprobaria existencia si no utilizamos inventario negativo
                              for (let index2 = 0; index2 < existencia.length; index2++) { //utilizar try catch
                                if (detalle_orden[index].idproducto == existencia[index2].idproducto) {
                                  nuevaExistencia = {}
                                  nuevaExistencia.idproducto = detalle_orden[index].idproducto
                                  nuevaExistencia.idsucursal = SucursalVenta
                                  nuevaExistencia.existencia = existencia[index2].existencia + detalle_orden[index].cantidad
                                  suma.push(nuevaExistencia)
                                }
                              }
                            }
                            console.log(suma);
                            //-----------------------------insertar las nuevas existencias
                            
                            //------------------------------------------------------------
                         let sqlAct = suma.map(item => `(${item.idproducto},${item.idsucursal},${item.existencia})`);
                         var queryActualizarInventario = "INSERT INTO pos.producto_sucursal (idproducto, idsucursal, existencia) VALUES"+sqlAct+"ON DUPLICATE KEY UPDATE existencia=VALUES(existencia)"
                         console.log(sqlAct);
                         console.log(queryActualizarInventario);
        
                         connection.query(queryActualizarInventario, function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
                          if (error) {
                            return connection.rollback(function () {
                              throw error;
                            });
                          }
                          
                          connection.commit(function (err) {
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
                                  message: 'Caso 4 cancelacion de venta solo con reintegracion del detalle de orden',
                                  Id: data_venta.iddocumento_venta
                                })
                              })
                            }
                          }); //Fin commit
                        });//Final de la query para insertar nuevas existencias
                        }); //final de la query para obtener la existencia en la sucursal
                      }//fin si el detalle de doc.venta no tiene productos caso 4
                      else{ //Si el detalle de doc.venta tiene productos caso 3 reintegracion de ambos
                        //detalle_orden
                        var productoTotal = [];
                        var resta2 = []
                        var nuevaExistencia = {
                          idproducto: null,
                          idsucursal: null,
                          existencia: null
                        }
                        productoTotal = detalle_orden.concat(detalle_venta);

                        let index
                        let index2

                        for (index = 0; index < productoTotal.length; index++) {//for para agrupar los datos de compra
                          for (index2 = index + 1; index2 < productoTotal.length; index2++) {
                            if (productoTotal[index].idproducto == productoTotal[index2].idproducto) {
                              productoTotal[index].cantidad = productoTotal[index].cantidad + productoTotal[index2].cantidad
                              productoTotal.splice(index2, 1);
                            }

                          }
                        }
                        console.log('Estos son los dos arrays de productos convinados');
                        console.log(productoTotal);

                        let sqlIds = productoTotal.map(item => `(${item.idproducto})`);
                          console.log(sqlIds);
                          var existenciasProductoSucursal = "SELECT * FROM pos.producto_sucursal WHERE idproducto IN (" + sqlIds + ") and idsucursal = ?";
                          connection.query(existenciasProductoSucursal, [SucursalVenta], function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
                            if (error) {
                              return connection.rollback(function () {
                                throw error;
                              });
                            }
                            console.log("Detalle del producto total");
                            console.log(productoTotal);
                            existencia = results
                            console.log('Existencias que hay de los productos vendidos en la sucursal del usuario');
                            console.log(existencia);
                            var suma = [];
                            var nuevaExistencia = {}
                            //-----------------------para agragar las nuevas eistencias
                            for (let index = 0; index < productoTotal.length; index++) { //En este ciclo anidado se comprobaria existencia si no utilizamos inventario negativo
                              for (let index2 = 0; index2 < existencia.length; index2++) { //utilizar try catch
                                if (productoTotal[index].idproducto == existencia[index2].idproducto) {
                                  nuevaExistencia = {}
                                  nuevaExistencia.idproducto = productoTotal[index].idproducto
                                  nuevaExistencia.idsucursal = SucursalVenta
                                  nuevaExistencia.existencia = existencia[index2].existencia + productoTotal[index].cantidad
                                  suma.push(nuevaExistencia)
                                }
                              }
                            }
                            console.log(suma);
                            //-----------------------------insertar las nuevas existencias
                            
                            //------------------------------------------------------------
                         let sqlAct = suma.map(item => `(${item.idproducto},${item.idsucursal},${item.existencia})`);
                         var queryActualizarInventario = "INSERT INTO pos.producto_sucursal (idproducto, idsucursal, existencia) VALUES"+sqlAct+"ON DUPLICATE KEY UPDATE existencia=VALUES(existencia)"
                         console.log(sqlAct);
                         console.log(queryActualizarInventario);
        
                         connection.query(queryActualizarInventario, function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
                          if (error) {
                            return connection.rollback(function () {
                              throw error;
                            });
                          }
                          
                          connection.commit(function (err) {
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
                                  message: 'Caso 3 cancelacion de venta con reintegracion de los productos de ambos detalles',
                                  Id: data_venta.iddocumento_venta
                                })
                              })
                            }
                          }); //Fin commit
                        });//Final de la query para insertar nuevas existencias
                        }); //final de la query para obtener la existencia en la sucursal
                      }//Fin si el detalle de doc.venta tiene productos caso 3 reintegracion de ambos
                    });
                  }//Fin //para el caso de orden vinculada unicamente con detalle de doc ventas
                });//Final de la query para el detalle de producto de la orden
              });
            
              }
         
            });//Final query para actualizar el estado del documento de venta
        } //final del else para trabajar con documentos que si existen

      }) //final primera Query
    } //final de las cancelaciones de ventas
    else if (body.tipo == 1) { //cancelaciones de compras

      connection.query('SELECT * from pos.factura_compra WHERE idfactura_compra=?', [numeroVenta], function (error, results, fields) { //query para determinar la sucursal del usuario
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }
        data_compra = results[0];
        
        if (results == "") { //para verificar que existe el documento de venta
          connection.commit(function (err) {
            console.log("Mensaje desde el commit");
            if (err) {
              return connection.rollback(function () {
                throw err;
              });
            } else {
              callback(null, {
                statusCode: 400,
                headers: {

                  'Access-Control-Allow-Origin': '*',

                  'Access-Control-Allow-Credentials': true,

                },
                body: JSON.stringify({
                  message: 'No existe la compra buscada'
                })
              })
            }
          }); //Fin commit
        }else if (data_compra.estado == 3) {//si el documento de venta esta cancelado agregar or para las compras
          connection.commit(function (err) {
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
                  message: 'La factura de compra ya fue cancelada, no es posible volver a cancelar'
                })
              })
            }
          }); //Fin commit
          
        }
        else { // Si existe el documento de venta entonces
          var SucursalCompra;
          SucursalCompra = data_compra.idsucursal;
                  //hacer el update de que esta cancelada a venta
            console.log("ID sucursal donde trabaja el usuario que esta haciendo la venta");
            console.log(SucursalCompra);

            console.log("Datos de la venta");
            console.log(data_compra);
            
            connection.query('UPDATE pos.factura_compra SET estado = 3 WHERE idfactura_compra = ?', [numeroVenta], function (error, results2, fields) { //query para actualizar a facturada la orden
              if (error) {
                return connection.rollback(function () {
                  throw error;
                });
              }
              
            
                console.log(numeroVenta);
                connection.query('SELECT * from pos.detalle_factura_compra WHERE idfactura_compra=?', [numeroVenta], function (error, results, fields) { //query para obtener los detalles del doc. de venta
                  if (error) {
                    return connection.rollback(function () {
                      throw error;
                    });
                  }
                  
                  var detalle_compra = results;
                // productos a consultar por existencia
                  let sqlIds = detalle_compra.map(item => `(${item.idproducto})`);
                  console.log(sqlIds);
                  var existenciasProductoSucursal = "SELECT * FROM pos.producto_sucursal WHERE idproducto IN (" + sqlIds + ") and idsucursal = ?";
                  connection.query(existenciasProductoSucursal, [SucursalCompra], function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
                    if (error) {
                      return connection.rollback(function () {
                        throw error;
                      });
                    }
                    console.log("Detalle de doc. compra");
                    console.log(detalle_compra);
                    existencia = results
                    console.log('Existencias que hay de los productos vendidos en la sucursal del usuario');
                    console.log(existencia);
                    var suma = [];
                    var nuevaExistencia = {}
                    //-----------------------para agragar las nuevas eistencias
                    for (let index = 0; index < detalle_compra.length; index++) { //En este ciclo anidado se comprobaria existencia si no utilizamos inventario negativo
                      for (let index2 = 0; index2 < existencia.length; index2++) { //utilizar try catch
                        if (detalle_compra[index].idproducto == existencia[index2].idproducto) {
                          nuevaExistencia = {}
                          nuevaExistencia.idproducto = detalle_compra[index].idproducto
                          nuevaExistencia.idsucursal = SucursalCompra
                          nuevaExistencia.existencia = existencia[index2].existencia - detalle_compra[index].cantidad
                          suma.push(nuevaExistencia)
                        }
                      }
                    }
                    console.log(suma);
                    //-----------------------------insertar las nuevas existencias
                    
                    //------------------------------------------------------------
                 let sqlAct = suma.map(item => `(${item.idproducto},${item.idsucursal},${item.existencia})`);
                 var queryActualizarInventario = "INSERT INTO pos.producto_sucursal (idproducto, idsucursal, existencia) VALUES"+sqlAct+"ON DUPLICATE KEY UPDATE existencia=VALUES(existencia)"
                 console.log(sqlAct);
                 console.log(queryActualizarInventario);

                 connection.query(queryActualizarInventario, function (error, results, fields) { //query para obtener la existencias de la sucursal del usuario
                  if (error) {
                    return connection.rollback(function () {
                      throw error;
                    });
                  }
                  
                  connection.commit(function (err) {
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
                          message: 'Reintegracion del detalle de documentos de compra exitoso',
                          Id: data_compra.iddocumento_venta
                        })
                      })
                    }
                  }); //Fin commit
                });//Final de la query para insertar nuevas existencias
                }); //final de la query para obtener la existencia en la sucursal
                }); // final de la query para obtener los productos del detalle de venta
              });//final del la query para actualizar a cancelada la compra
            }//final del else para cuando todo esta bien
              });//final de la query principal
          
    } //final del else if para cancelaciones de compras
  }) //final de la transaccion

}; //final de la funcion

module.exports.findShop = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info

  var numeroCompra = [event.pathParameters.numero]

  const sql = 'SELECT * FROM pos.factura_compra where pos.factura_compra.idfactura_compra = ?';
  const sql2 = 'SELECT * FROM pos.detalle_factura_compra where pos.detalle_factura_compra.idfactura_compra = ?';
  
  var detalle = [];

  var data3 = {
    idfactura_compra: null,
    numero: null,
    serie: null,
    fecha: null,
    idproveedor: null,
    total: null,
    idusuario: null,
    idsucursal: null,
    estado: null,
    detalle: null
  };
  var data = {};
  var data2 = {};
  connection.query(sql, numeroCompra, (error, rows) => {
    if (error) {
      callback({
        statusCode: 500,
        body: JSON.stringify(error)
      })
    } else {
      data = rows;

      connection.query(sql2, numeroCompra, (error, rows2) => { //Query para el detalle de servicios
        if (error) {
          callback({
            statusCode: 500,
            body: JSON.stringify(error)
          })
        } else {

              if(rows2 != "") {
                console.log("Detalle de orden");
                console.log(rows2);


                data3.idfactura_compra = rows[0].idfactura_compra;
                data3.numero = rows[0].numero;
                data3.serie = rows[0].serie;
                data3.fecha = rows[0].fecha;
                data3.idproveedor = rows[0].idproveedor;
                data3.total = rows[0].total;
                data3.idusuario = rows[0].idusuario;
                data3.idsucursal = rows[0].idsucursal;
                data3.estado = rows[0].estado;
                data3.detalle = rows2;

                callback(null, { //inicio rows
                  statusCode: 200,
                  headers: {

                    'Access-Control-Allow-Origin': '*',

                    'Access-Control-Allow-Credentials': true,

                  },
                  body: JSON.stringify(
                    data3

                  )
                }) //final callback
              } else {
                callback(null, { //inicio rows
                  statusCode: 404,
                  headers: {

                    'Access-Control-Allow-Origin': '*',

                    'Access-Control-Allow-Credentials': true,

                  },
                  body: JSON.stringify({
                    message: "Compra no encontrada"
                  })
                }) //final callback
              }
         
        }
      }) //Final del detalle de servicios  
      //callback(null, { //inicio rows
      // statusCode: 200,
      //body: JSON.stringify({
      // clientes: rows
      //})
      //}) //final callback
    } //final else
  }) //final  query


};
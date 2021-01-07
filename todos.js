'use strict';
const connection = require('../connection');
const queryString = require('querystring');
const Validator = require('validatorjs');
const auth = require('./auth_token');

//auth.auth_token();

var resC;
var id1;
module.exports.findAllSucursal = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info

  var idSuc = [event.pathParameters.idSucursal]
  console.log(idSuc);
  const sql = 'SELECT pos.producto.idproducto, pos.producto.codigo, pos.producto.nombre, pos.producto.descripcion, pos.marca.nombre_marca, pos.categoria.nombre_categoria, pos.producto.modelo, pos.producto.talla, pos.producto.min, pos.producto.max, pos.producto.costo, pos.producto.estado, pos.producto.linea, pos.producto.observacion FROM pos.producto inner join pos.marca inner join pos.categoria on pos.producto.idmarca = pos.marca.idmarca and pos.producto.idcategoria = pos.categoria.idcategoria';
  const sql2 = 'SELECT * FROM pos.precio';
  //const sql3 = 'SELECT * FROM pos.producto_sucursal';
  //const sql3 = 'select pos.producto_sucursal.idproducto,pos.sucursal.idsucursal, pos.sucursal.nombre, pos.producto_sucursal.existencia from pos.producto_sucursal inner join pos.sucursal where pos.producto_sucursal.idsucursal = pos.sucursal.idsucursal';
  const sql3 = 'select pos.producto_sucursal.idproducto,pos.sucursal.idsucursal, pos.sucursal.nombre, pos.producto_sucursal.existencia from pos.producto_sucursal inner join pos.sucursal where pos.producto_sucursal.idsucursal = ? and pos.sucursal.idsucursal = ?';
  const sucursal = 'SELECT * FROM pos.sucursal';
  var precio = [];
  var existencia = []
  var sucursales = {}
  var data3 = {
    idproducto: null,
    codigo: null,
    nombre: null,
    descripcion: null,
    marca: null, //Agregar marca
    categoria: null, //Agregar categoria
    modelo: null,
    talla: null,
    min: null,
    max: null,
    costo: null,
    precio: null,
    estado: null,
    linea: null,
    existencia: null,
    observacion: null
  };

  var result = [];
  var detalle = [];

  var data = {};
  var data2 = {};
  connection.query(sql, (error, rows) => {
    if (error) {
      callback({
        statusCode: 500,
        body: JSON.stringify(error)
      })
    } else {
      data = rows;
      /*connection.query(sucursal, (error, rows4) => {//inicio query para las sucursales
        if (error) {
          callback({
            statusCode: 500,
            body: JSON.stringify(error)
          })
        }else {
          sucursales = rows4*/
      connection.query(sql3, [idSuc, idSuc], (error, rows3) => { //inicio query para la existencia
        if (error) {
          callback({
            statusCode: 500,
            body: JSON.stringify(error)
          })
        } else {
          existencia = rows3
          console.log(existencia);

          connection.query(sql2, (error, rows2) => { //inicio query para los precios
            if (error) {
              callback({
                statusCode: 500,
                body: JSON.stringify(error)
              })
            } else {
              data2 = rows2;
              var id;
              var detalle = [];
              //var ext = [];
              var ext
              for (let index = 0; index < data.length; index++) {
                id = data[index].idproducto;
                data3 = {
                  idproducto: data[index].idproducto,
                  codigo: data[index].codigo,
                  nombre: data[index].nombre,
                  descripcion: data[index].descripcion,
                  marca: data[index].nombre_marca,
                  categoria: data[index].nombre_categoria,
                  modelo: data[index].modelo,
                  talla: data[index].talla,
                  min: data[index].min,
                  max: data[index].max,
                  costo: data[index].costo,
                  estado: data[index].estado,
                  linea: data[index].linea,
                  observacion: data[index].observacion
                }

                result[index] = data3;
                for (let index2 = 0; index2 < data2.length; index2++) {
                  if (data2[index2].idproducto == id) {
                    //los mas cercanos al funcionamiento

                    detalle.push(data2[index2].precio);


                  }
                }
                /*for (let index4 = 0; index4 < sucursales.length; index4++) {//para escoger la sucursal
                  if (sucursales[index4].idsucursal == id) {
                    //los mas cercanos al funcionamiento                  
                    //ext.push(sucursales[index4]);                                                            
                    ext.push(sucursales[index4]);                                                            
                  }
                }*/
                for (let index3 = 0; index3 < existencia.length; index3++) { //para escoger aignar las existencias
                  if (existencia[index3].idproducto == id) {
                    //los mas cercanos al funcionamiento                  
                    ext = existencia[index3].existencia;
                  }
                }

                result[index].precio = detalle;
                result[index].existencias = ext;
                detalle = [];
                ext = 0;
                //result[index].detalles=detalle;
                //data3.detalles = detalle;

              }

              callback(null, { //inicio rows
                statusCode: 200,
                headers: {

                  'Access-Control-Allow-Origin': '*',

                  'Access-Control-Allow-Credentials': true,

                },
                body: JSON.stringify({
                  productos: result
                })
              }) //final callback
            }
          }) //final Query para los precios
        } //final del else de las existecias
      }) //final Query para las existencias
      /*}//final del else de las sucursales
          }) //final Query para las sucursales*/

    } //final else
  }) //final  query
};
module.exports.findAll = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info

  const sql = 'SELECT pos.producto.idproducto, pos.producto.codigo,pos.producto.idmarca,pos.producto.idcategoria, pos.producto.nombre, pos.producto.descripcion, pos.marca.nombre_marca, pos.categoria.nombre_categoria, pos.producto.modelo, pos.producto.talla, pos.producto.min, pos.producto.max, pos.producto.costo, pos.producto.estado, pos.producto.linea, pos.producto.observacion FROM pos.producto inner join pos.marca inner join pos.categoria on pos.producto.idmarca = pos.marca.idmarca and pos.producto.idcategoria = pos.categoria.idcategoria';
  const sql2 = 'SELECT * FROM pos.precio';
  //const sql3 = 'SELECT * FROM pos.producto_sucursal';
  //const sql3 = 'select pos.producto_sucursal.idproducto,pos.sucursal.idsucursal, pos.sucursal.nombre, pos.producto_sucursal.existencia from pos.producto_sucursal inner join pos.sucursal where pos.producto_sucursal.idsucursal = pos.sucursal.idsucursal';
  const sql3 = 'select pos.producto_sucursal.idproducto,pos.sucursal.idsucursal, pos.sucursal.nombre, pos.producto_sucursal.existencia from pos.producto_sucursal inner join pos.sucursal where pos.producto_sucursal.idsucursal = pos.sucursal.idsucursal';
  const sucursal = 'SELECT * FROM pos.sucursal';
  var precio = [];
  var existencia = []
  var sucursales = {}
  var data3 = {
    idproducto: null,
    codigo: null,
    nombre: null,
    descripcion: null,
    idmarca: null, //Agregar marca
    idcategoria: null, //Agregar categoria
    marca: null, //Agregar marca
    categoria: null, //Agregar categoria
    modelo: null,
    talla: null,
    min: null,
    max: null,
    costo: null,
    precio: null,
    estado: null,
    linea: null,
    existencia: null,
    observacion: null
  };

  var result = [];
  var detalle = [];

  var data = {};
  var data2 = {};
  connection.query(sql, (error, rows) => {
    if (error) {
      callback({
        statusCode: 500,
        body: JSON.stringify(error)
      })
    } else {
      data = rows;
      /*connection.query(sucursal, (error, rows4) => {//inicio query para las sucursales
        if (error) {
          callback({
            statusCode: 500,
            body: JSON.stringify(error)
          })
        }else {
          sucursales = rows4*/
      connection.query(sql3, (error, rows3) => { //inicio query para la existencia
        if (error) {
          callback({
            statusCode: 500,
            body: JSON.stringify(error)
          })
        } else {
          existencia = rows3
          console.log(existencia);

          connection.query(sql2, (error, rows2) => { //inicio query para los precios
            if (error) {
              callback({
                statusCode: 500,
                body: JSON.stringify(error)
              })
            } else {
              data2 = rows2;
              var id;
              var detalle = [];
              var ext = [];
              for (let index = 0; index < data.length; index++) {
                id = data[index].idproducto;
                data3 = {
                  idproducto: data[index].idproducto,
                  codigo: data[index].codigo,
                  nombre: data[index].nombre,
                  descripcion: data[index].descripcion,
                  idmarca: data[index].idmarca, //Agregar marca
                  idcategoria: data[index].idcategoria, //Agregar categoria
                  marca: data[index].nombre_marca,
                  categoria: data[index].nombre_categoria,
                  modelo: data[index].modelo,
                  talla: data[index].talla,
                  min: data[index].min,
                  max: data[index].max,
                  costo: data[index].costo,
                  estado: data[index].estado,
                  linea: data[index].linea,
                  observacion: data[index].observacion
                }

                result[index] = data3;
                for (let index2 = 0; index2 < data2.length; index2++) {
                  if (data2[index2].idproducto == id) {
                    //los mas cercanos al funcionamiento

                    detalle.push(data2[index2].precio);


                  }
                }
                /*for (let index4 = 0; index4 < sucursales.length; index4++) {//para escoger la sucursal
                  if (sucursales[index4].idsucursal == id) {
                    //los mas cercanos al funcionamiento                  
                    //ext.push(sucursales[index4]);                                                            
                    ext.push(sucursales[index4]);                                                            
                  }
                }*/
                for (let index3 = 0; index3 < existencia.length; index3++) { //para escoger aignar las existencias
                  if (existencia[index3].idproducto == id) {
                    //los mas cercanos al funcionamiento                  
                    ext.push(existencia[index3]);
                  }
                }

                result[index].precio = detalle;
                result[index].existencias = ext;
                detalle = [];
                ext = [];
                //result[index].detalles=detalle;
                //data3.detalles = detalle;

              }

              callback(null, { //inicio rows
                statusCode: 200,
                headers: {

                  'Access-Control-Allow-Origin': '*',

                  'Access-Control-Allow-Credentials': true,

                },
                body: JSON.stringify({
                  productos: result
                })
              }) //final callback
            }
          }) //final Query para los precios
        } //final del else de las existecias
      }) //final Query para las existencias
      /*}//final del else de las sucursales
          }) //final Query para las sucursales*/

    } //final else
  }) //final  query

};

module.exports.findProduct = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const sql = 'SELECT * FROM pos.producto WHERE nombre LIKE ?';


  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }
    var data = decodeURIComponent([event.pathParameters.nombre]);
    //console.log(data);

    data = "%" + data + "%";
    connection.query(sql, data, function (error, results, fields) {
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      connection.commit(function (err) { ///
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
              producto: results
            })
          })
        }
        //--------------------------------
      }); //Fin commit

    }); //final query principal
  }); //final begin transaction
};

module.exports.findClients = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info

  const sql = 'SELECT * FROM pos.cliente';

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
          clientes: rows
        })
      }) //final rows
    }
  })
};

module.exports.findOrders = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info

  const sql = 'SELECT * FROM pos.orden';
  const sql2 = 'SELECT * FROM pos.detalle_orden';
  var result = [];
  var detalle = [];
  var data3 = {
    idorden: null,
    idempleado: null,
    idtaller: null,
    total: null,
    fecha_inicio: null,
    fecha_entrega: null,
    tipo: null,
    idusuario: null,
    estado: null,
    descripcion: null,
    referencia: null,
    //idsucursal: null,
    detalle: null
  };
  var data = {};
  var data2 = {};
  connection.query(sql, (error, rows) => {
    if (error) {
      callback({
        statusCode: 500,
        body: JSON.stringify(error)
      })
    } else {
      data = rows;

      connection.query(sql2, (error, rows2) => {
        if (error) {
          callback({
            statusCode: 500,
            body: JSON.stringify(error)
          })
        } else {
          data2 = rows2;
          var id;
          var detalle = [];
          for (let index = 0; index < data.length; index++) {
            id = data[index].idorden;
            data3 = {
              idorden: data[index].idorden,
              idempleado: data[index].idempleado,
              idtaller: data[index].idtaller,
              total: data[index].total,
              fecha_inicio: data[index].fecha_inicio,
              fecha_entrega: data[index].fecha_entrega,
              tipo: data[index].tipo,
              idusuario: data[index].idusuario,
              estado: data[index].estado,
              descripcion: data[index].descripcion,
              referencia: data[index].referencia,
              //idsucursal: data[index].idsucursal
            }
            result[index] = data3;
            for (let index2 = 0; index2 < data2.length; index2++) {
              if (data2[index2].idorden == id) {
                //los mas cercanos al funcionamiento
                /*
                  detalle[index] = data2[index2];
                  result[index].detalles=detalle[index];  
                */
                //data3.detalles = data2[index2];
                detalle.push(data2[index2]);

                //if (detalle[index2].idorden == id) {



                //}

                //result[index].detalles = data2[index2];
                //detalle.push(data2[index2]);

              }
            }
            result[index].detalle = detalle;
            detalle = [];
            //result[index].detalles=detalle;
            //data3.detalles = detalle;

          }
          /*for (var clave in data){
            // Controlando que json realmente tenga esa propiedad
            if (data.hasOwnProperty(clave)) {
              // Mostrando en pantalla la clave junto a su valor
              if (data[clave]=="") {
                data[clave] = null;
              }
            }
          }*/
          callback(null, { //inicio rows
            statusCode: 200,
            headers: {

              'Access-Control-Allow-Origin': '*',

              'Access-Control-Allow-Credentials': true,

            },
            body: JSON.stringify({
              ordenes: result
            })
          }) //final callback
        }
      })
      //callback(null, { //inicio rows
      // statusCode: 200,
      //body: JSON.stringify({
      // clientes: rows
      //})
      //}) //final callback
    } //final else
  }) //final  query


};

module.exports.findOrder = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info

  var numeroOrden = [event.pathParameters.numero]

  const sql = 'SELECT * FROM pos.orden where pos.orden.idorden = ?';
  const sql2 = 'SELECT * FROM pos.detalle_orden where pos.detalle_orden.idorden = ?';
  const sql3 = 'SELECT * FROM pos.detalle_producto where pos.detalle_producto.idorden = ?';
  var detalle = [];

  var data3 = {
    idorden: null,
    idempleado: null,
    idtaller: null,
    total: null,
    fecha_inicio: null,
    fecha_entrega: null,
    tipo: null,
    idusuario: null,
    estado: null,
    descripcion: null,
    referencia: null,
    idsucursal: null,
    detalle: null,
    detalle_producto: null
  };
  var data = {};
  var data2 = {};
  connection.query(sql, numeroOrden, (error, rows) => {
    if (error) {
      callback({
        statusCode: 500,
        body: JSON.stringify(error)
      })
    } else {
      data = rows;



      connection.query(sql2, numeroOrden, (error, rows2) => { //Query para el detalle de servicios
        if (error) {
          callback({
            statusCode: 500,
            body: JSON.stringify(error)
          })
        } else {

          connection.query(sql3, numeroOrden, (error, rows3) => { //Query para el detalle de productos
            if (error) {
              callback({
                statusCode: 500,
                body: JSON.stringify(error)
              })
            } else {

              try {
                console.log("Detalle de orden");
                console.log(rows);


                data3.idorden = rows[0].idorden;
                data3.idempleado = rows[0].idempleado;
                data3.idtaller = rows[0].idtaller;
                data3.total = rows[0].total;
                data3.fecha_inicio = rows[0].fecha_inicio;
                data3.fecha_entrega = rows[0].fecha_entrega;
                data3.tipo = rows[0].tipo;
                data3.idusuario = rows[0].idusuario;
                data3.estado = rows[0].estado;
                data3.descripcion = rows[0].descripcion;
                data3.referencia = rows[0].referencia;
                data3.idsucursal = rows[0].idsucursal;
                data3.detalle = rows2;
                data3.detalle_producto = rows3;


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
              } catch (TypeError) {
                callback(null, { //inicio rows
                  statusCode: 404,
                  headers: {

                    'Access-Control-Allow-Origin': '*',

                    'Access-Control-Allow-Credentials': true,

                  },
                  body: JSON.stringify({
                    message: "Orden no encontrada"
                  }
                  )
                }) //final callback
              }

            }


          }) //Final del detalle de productos
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

module.exports.updateOrder = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);

  var queryDeleteDetalleOrden = "DELETE FROM pos.detalle_orden WHERE pos.detalle_orden.idorden = ?";
  var queryDeleteDetalleProducto = "DELETE FROM pos.detalle_producto WHERE pos.detalle_producto.idorden = ?";
  var rules = {}

  if(body.detalle != "" && body.detalle_producto != ""){
  rules = {
    idorden: 'required|integer',
    idempleado: 'required|integer',
    idtaller: 'required|integer',
    total: 'required|numeric',
    fecha_inicio: 'required|date',
    fecha_entrega: 'required|date',
    tipo: 'required|integer',
    idusuario: 'required|integer',
    estado: 'integer',
    descripcion: 'string|max:255',
    referencia: 'required|string|max:100',
    idusuario: 'required|integer',
    'detalle.*.idservicio': 'required|integer',
    'detalle.*.precio': 'required|numeric',
    'detalle.*.comentario': 'string|max:100',
    'detalle.*.descuento': 'required|numeric',
    'detalle.*.total': 'required|numeric',
    'detalle.*.estado': 'required|integer',
    'detalle_producto.*.idproducto': 'required|integer',
    'detalle_producto.*.cantidad': 'required|numeric',
    'detalle_producto.*.precio_venta': 'required|numeric',
    'detalle_producto.*.tipo_precio': 'required|numeric',
  };
}else if (body.detalle != "" && body.detalle_producto == "") {
  rules = {
    idorden: 'required|integer',
    idempleado: 'required|integer',
    idtaller: 'required|integer',
    total: 'required|numeric',
    fecha_inicio: 'required|date',
    fecha_entrega: 'required|date',
    tipo: 'required|integer',
    idusuario: 'required|integer',
    estado: 'integer',
    descripcion: 'string|max:255',
    referencia: 'required|string|max:100',
    idsucursal:'required|integer',
    'detalle.*.idservicio': 'required|integer',
    'detalle.*.precio': 'required|numeric',
    'detalle.*.comentario': 'string|max:100',
    'detalle.*.descuento': 'required|numeric',
    'detalle.*.total': 'required|numeric',
    'detalle.*.estado': 'required|integer'
  }
}
  
 

  // Obteniendo todas las claves del JSON
  let validation = new Validator(body, rules);
  if (validation.passes()) {

    var data = {
      idempleado: body.idempleado,
      idtaller: body.idtaller,
      total: body.total,
      fecha_inicio: body.fecha_inicio,
      fecha_entrega: body.fecha_entrega,
      tipo: body.tipo,
      idusuario: body.idusuario,
      estado: body.estado,
      descripcion: body.descripcion,
      referencia: body.referencia,
      idsucursal: body.idsucursal
    };
  for (var clave in data) {
    // Controlando que json realmente tenga esa propiedad
    if (data.hasOwnProperty(clave)) {
      // Mostrando en pantalla la clave junto a su valor
      if (data[clave] == "") {
        data[clave] = null;
      }
    }
  }
 /*   verificar este vergueo des pues, esto es seguridad por si envian un json desde un lugar extraño
if ((data.estado == 2) ||(data<1) || (data>3)){
  callback(null, {
    statusCode: 500,
    headers: {

      'Access-Control-Allow-Origin': '*',

      'Access-Control-Allow-Credentials': true,

    },
    body: JSON.stringify({
      message: 'No se puede colocar una orden como facturada, 1: para activarla 2: para cancelarla'
    })
  })
}*/
  var datade = body.detalle;
  var data_producto = body.detalle_producto;



  connection.beginTransaction(function (err) {
    var idG;
    
    if (err) {
      throw err;
    }

    connection.query('SELECT * FROM pos.orden WHERE pos.orden.idorden = ?', [body.idorden], function (error, results, fields) { //[body.todo, event.pathParameters.todo]
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      console.log('Muestra el estado de la orden');
      console.log(results);
      console.log(results[0].estado);
      if (results[0].estado == 2) {
        
        connection.commit(function (err) {
          //console.log("Mensaje desde el commit");
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
                message: 'La orden ya fue facturada, no es posible modificarla',
                id: body.idorden
              })
            })
          }
        }); //Fin commit


      }else if((results[0].estado == 1 || results[0].estado == 3 )&& datade != "" && data_producto != ""){
    connection.query('UPDATE pos.orden SET ? WHERE pos.orden.idorden = ?', [data, body.idorden], function (error, results, fields) { //[body.todo, event.pathParameters.todo]
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }
      idG = body.idorden; //Id de orden


      connection.query(queryDeleteDetalleOrden, [idG], function (error, results, fields) { //Para eliminar el detalle de orden
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }

        connection.query(queryDeleteDetalleProducto, [idG], function (error, results, fields) { //Para eliminar el detalle de producto
          if (error) {
            return connection.rollback(function () {
              throw error;
            });
          }

          //------------------------------------------ mapeo de datos para crear nuevos registros
          let sql = datade.map(item => `(${idG},${item.idservicio}, ${item.precio}, ${"'"}${item.comentario}${"'"}, ${item.descuento}, ${item.total}, ${item.estado})`)
          //array with items.
          //console.log(sql);
          const finalQuery = "INSERT INTO pos.detalle_orden (idorden,idservicio, precio, comentario, descuento,total,estado) VALUES " + sql
          //console.log(finalQuery)
          //console.log("query("+finalQuery+")")
          //---------------------------------------------
          connection.query(finalQuery, function (error, results, fields) { //Para el detalle de orden
            if (error) {
              return connection.rollback(function () {
                throw error;
              });
            }

            let sql2 = data_producto.map(item => `(${idG},${item.idproducto}, ${item.cantidad}, ${item.precio_venta}, ${item.tipo_precio})`)

            console.log("valores de los articulos que se venderan en la orden");
            console.log(sql2);
            const finalQuery2 = "INSERT INTO pos.detalle_producto (idorden,idproducto, cantidad, precio_venta, tipo_precio) VALUES " + sql2
            //codigo para mapear las querys
            //let sql = datade.map(item => `(${idG},${item.idservicio}, ${item.precio}, ${"'"}${item.comentario}${"'"}, ${item.descuento}, ${item.total}, ${item.estado})`)
            //let sql = datade.map(item => `(${"idorden = "}${idG},${" idservicio = "}${item.idservicio},${"precio = "}${item.precio},${" comentario = "} ${"'"}${item.comentario}${"'"},${" descuento = "} ${item.descuento}, ${" total = "}${item.total},${" estado = "} ${item.estado})`)     
            //const finalQuery = "UPDATE pos.detalle_orden SET (idorden,idservicio, precio, comentario, descuento,total,estado) VALUES " + sql+"  WHERE pos.detalle_orden.idorden = ?"
            //const finalQuery = "UPDATE pos.detalle_orden SET " + sql+"  WHERE pos.detalle_orden.idorden = ?"     
            //console.log("Mapeado");
            //console.log(finalQuery);


            connection.query(finalQuery2, function (error, results, fields) { //Para el detalle de producto
              if (error) {
                return connection.rollback(function () {
                  throw error;
                });
              }
              connection.commit(function (err) {
                //console.log("Mensaje desde el commit");
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
                      message: 'orden, detalle de servicios y detalle de productos actualizados correctamente',
                      id: body.idorden
                    })
                  })
                }
              }); //Fin commit
            }); //fin del query para insertar el detalle de producto
          }); //fin del query para insertar el detalle de orden
        }); //fin del query para eliminar detalle de producto
      }); //fin del query para eliminar detalle de orden
    }); //final query principal
  }else if ((results[0].estado == 1 || results[0].estado == 3 ) && datade != "" && data_producto == "") {
    connection.query('UPDATE pos.orden SET ? WHERE pos.orden.idorden = ?', [data, body.idorden], function (error, results, fields) { //[body.todo, event.pathParameters.todo]
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }
      idG = body.idorden; //Id de orden


      connection.query(queryDeleteDetalleOrden, [idG], function (error, results, fields) { //Para eliminar el detalle de orden
        if (error) {
          return connection.rollback(function () {
            throw error;
          });
        }

        connection.query(queryDeleteDetalleProducto, [idG], function (error, results, fields) { //Para eliminar el detalle de producto
          if (error) {
            return connection.rollback(function () {
              throw error;
            });
          }

          //------------------------------------------ mapeo de datos para crear nuevos registros
          let sql = datade.map(item => `(${idG},${item.idservicio}, ${item.precio}, ${"'"}${item.comentario}${"'"}, ${item.descuento}, ${item.total}, ${item.estado})`)
          //array with items.
          //console.log(sql);
          const finalQuery = "INSERT INTO pos.detalle_orden (idorden,idservicio, precio, comentario, descuento,total,estado) VALUES " + sql
          //console.log(finalQuery)
          //console.log("query("+finalQuery+")")
          //---------------------------------------------
          connection.query(finalQuery, function (error, results, fields) { //Para el detalle de orden
            if (error) {
              return connection.rollback(function () {
                throw error;
              });
            }

            
              connection.commit(function (err) {
                //console.log("Mensaje desde el commit");
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
                      message: 'orden y detalle de servicios sin detalle de producto actualizados correctamente',
                      id: body.idorden
                    })
                  })
                }
              }); //Fin commit
            
          }); //fin del query para insertar el detalle de orden
        }); //fin del query para eliminar detalle de producto
      }); //fin del query para eliminar detalle de orden
    }); //final query principal
  }
  else if ((results[0].estado == 1 || results[0].estado == 3 ) && datade == "" ) {
    callback(null, {
      statusCode: 500,
      headers: {

        'Access-Control-Allow-Origin': '*',

        'Access-Control-Allow-Credentials': true,

      },
      body: JSON.stringify({
        message: 'No es posible agregar una orden sin servicios',
        id: body.idorden
      })
    })
  }
  }); //Query para saber si se puede actualizar o no
  
  }); //final begin transaction
  }//Fin del if de validacion del JSON
  else{
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

};

/*module.exports.updateOrder = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = queryString.parse(event['body']);
  
  var data = {
    idorden: null,
    idempleado: body.idempleado,
    idtaller: body.idtaller,
    total: body.total,
    fecha_inicio: body.fecha_inicio,
    fecha_entrega: body.fecha_entrega,
    tipo: body.tipo,
    idusuario: body.idusuario,
    estado: body.estado,
    descripcion: body.descripcion,
    referencia: body.referencia
  };
  var datade = body.detalle;
  
  for (var clave in data){
    // Controlando que json realmente tenga esa propiedad
    if (data.hasOwnProperty(clave)) {
      // Mostrando en pantalla la clave junto a su valor
      if (data[clave]=="") {
        data[clave] = null;
      }
    }
  }
  
  const sql = 'UPDATE todos SET todo = ? WHERE idtodos = ?';
  connection.query(sql, [body.todo, event.pathParameters.todo], (error, result) => {
    if (error) {
      callback({
        statusCode: 500,
        body: JSON.stringify(error)
      })
    } else {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          res: `Todo actualizado correctamente`
        })
      })
    }
  })
};*/
module.exports.findEmployee = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info

  const sql = 'SELECT * FROM pos.empleado';

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
          empleados: rows
        })
      }) //final rows
    }
  })
};

module.exports.findServices = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info

  const sql = 'SELECT * FROM pos.servicio';

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
          servicios: rows
        })
      }) //final rows
    }
  })
};

module.exports.findDepartment = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info

  const sql = 'SELECT * FROM pos.departamento';

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
          departamentos: rows
        })
      }) //final rows
    }
  })
};

module.exports.findMunicipio = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info

  const sql = 'SELECT * FROM pos.municipio';

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
          municipios: rows
        })
      }) //final rows
    }
  })
};

module.exports.findBrand = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info
  
  
  
  //console.log(event.path);
  const sql = 'SELECT * FROM pos.marca';

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
          marcas: rows
        })
      }) //final rows
    }
  })
  
};
module.exports.findCategory = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info

  const sql = 'SELECT * FROM pos.categoria';

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
          categorias: rows
        })
      }) //final rows
    }
  })
};

module.exports.findOne = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const sql = 'SELECT * FROM pos.cliente WHERE nombre LIKE ?';


  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }
    var data = decodeURIComponent([event.pathParameters.nombre]);
    //console.log(data);

    data = "%" + data + "%";
    connection.query(sql, data, function (error, results, fields) {
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      connection.commit(function (err) { ///
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
              cliente: results
            })
          })
        }
        //--------------------------------
      }); //Fin commit

    }); //final query principal
  }); //final begin transaction

};
module.exports.findOneNit = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const sql = 'SELECT * FROM pos.cliente WHERE nit = ?';


  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }
    //var data = decodeURIComponent([event.pathParameters.nombre]);
    var data = [event.pathParameters.nit];
    console.log(data);

    //data = "%"+data+"%";
    connection.query(sql, data, function (error, results, fields) {
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      connection.commit(function (err) { ///
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
              cliente: results
            })
          })
        }
        //--------------------------------
      }); //Fin commit

    }); //final query principal
  }); //final begin transaction

};

module.exports.findOneEmployee = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const sql = 'SELECT * FROM pos.empleado WHERE nombre LIKE ?';


  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }
    var data = decodeURIComponent([event.pathParameters.nombre]);
    //console.log(data);

    data = "%" + data + "%";
    connection.query(sql, data, function (error, results, fields) {
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      connection.commit(function (err) { ///
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
              empleado: results
            })
          })
        }
        //--------------------------------
      }); //Fin commit

    }); //final query principal
  }); //final begin transaction

};
/*module.exports.findOne = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const sql = 'SELECT * FROM pos.cliente WHERE nombre LIKE ?';
  //var resultn;
  var resultn = [];
  var i = 0;
  var j = 0;
//----------------------------------------quey con bucle------------------------------------
      connection.beginTransaction(function(err) {//inicio de la transaction


        if (err) { throw err; }

        
        connection.query(sql, [event.pathParameters.nombre], function (error, results, fields) {
          if (error) {
            return connection.rollback(function() {
              throw error;
            });
          }

          //var log = 'Post ' + results.insertId + ' added';
          console.log(results.length);
          //console.log(results[0].tipo);
          
          for (let n = 0; n < results.length; n++) {
            //const element = array[n];
            
            if (results[n].tipo == 2) {
              console.log("juridico");  
              resultn[n] = results[n];
            }
            if (results[n].tipo == 1) {
              j=1;
            }
            if (results[n].tipo == 2) {
              j=1;
            }
            
          }
          
        //-----------------------quey para devolver solo el individual con nombre-----------
        connection.query('INSERT INTO log SET data=?', log, function (error, results, fields) {
            if (error) {
              return connection.rollback(function() {
                throw error;
              });
            }
          });
        //----------------------fin quey para devolver solo el individual con nombre--
          return(callback(null, {
            statusCode: 200,
            body: JSON.stringify({
              juridico: resultn
            })
          }));

          //connection.query('INSERT INTO log SET data=?', log, function (error, results, fields) {
          //  if (error) {
          //    return connection.rollback(function() {
          //      throw error;
          //    });
          //  }
          //});
        });

        connection.commit(function(err) {
              if (err) {
                return connection.rollback(function() {
                  throw err;
                });
              }
              console.log('success!');
              
            });

      }); //fin de la transaccion
 //--------------------fin de query con bucle----------------------------------------
       
  //---------------------------------------------------------------
  connection.query(sql, [event.pathParameters.nombre], (error, rows) => {
    if (error) {
      callback({
        statusCode: 500,
        body: JSON.stringify(error)
      })
    } else {//inicio del else
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          clientes: rows
        })
      })
    }//fin del else
  })//fin de la query normal
//---------------------------------------------------------------
};*/

module.exports.handledata = (event, context, callback) => {
  //context.callbackWaitsForEmptyEventLoop = false;

  var hola = {
    "hola": "mundo"
  };
  //const body = queryString.parse(event['body']);
  var bodys = JSON.parse(event.body);
  //var bodys = event['body'];
  bodys.hola = "hellow";

  callback(null, {
    statusCode: 200,
    headers: {

      'Access-Control-Allow-Origin': '*',

      'Access-Control-Allow-Credentials': true,

    },
    body: JSON.stringify(bodys)
  });

};
//--crear empleado
module.exports.createEmployee = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
//-----------
var rules = {
  nombre: 'required|string|max:45',
  telefono1: 'required|string|max:20',
  telefono2: 'string|max:20',
  direccion: 'required|string|max:255',
  idmunicipio: 'required|integer',
  iddepartamento: 'required|integer',
  email: 'email|max:45',
  salario_base: 'numeric',
  idpuesto: 'required|integer',
  idsucursal: 'required|integer',
  fecha_ingreso: 'required|date'
};

let validation = new Validator(body, rules);
if (validation.passes()) {
  
//----------
  var data = {
    idempleado: null,
    nombre: body.nombre,
    telefono1: body.telefono1,
    telefono2: body.telefono2,
    direccion: body.direccion,
    idmunicipio: body.idmunicipio,
    iddepartamento: body.iddepartamento,
    email: body.email,
    salario_base: body.salario_base,
    idpuesto: body.idpuesto,
    idsucursal: body.idsucursal,
    fecha_ingreso: body.fecha_ingreso

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



  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }
    connection.query('INSERT INTO empleado SET ?', [data], function (error, results, fields) {
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      idG = results.insertId;

      connection.commit(function (err) { ///
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
              message: 'Empleado insertado correctamente',
              id: idG
            })
          })
        }

        //--------------------------------
      }); //Fin commit





    }); //final query principal
  }); //final begin transaction

}//final de la validacion de JSON
else{
  
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
//--fin crear empleado

//--crear servicio
module.exports.createService = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
//-------------------------
var rules = {
  nombre: 'required|string|max:45',
  costo: 'required|numeric'
};

let validation = new Validator(body, rules);
if (validation.passes()) {
//-------------------------

  var data = {
    idservicio: null,
    nombre: body.nombre,
    costo: body.costo
  };
  // Obteniendo todas las claves del JSON



  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }
    connection.query('INSERT INTO servicio SET ?', [data], function (error, results, fields) {
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      idG = results.insertId;

      connection.commit(function (err) { ///
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
              message: 'servicio insertado correctamente',
              id: idG
            })
          })
        }

        //--------------------------------
      }); //Fin commit





    }); //final query principal
  }); //final begin transaction
}//final de la validacion
else{
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
//--fin crear servicio

//--crear orden
module.exports.createOrder = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
  var rules = {};

  if(body.detalle != "" && body.detalle_producto != ""){
    rules = {
      idempleado: 'integer',
      idtaller: 'required|integer',
      total: 'required|numeric',
      fecha_inicio: 'required|date',
      fecha_entrega: 'required|date',
      tipo: 'required|integer',
      idusuario: 'required|integer',
      estado: 'integer',
      descripcion: 'string|max:255',
      referencia: 'required|string|max:100',
      idsucursal: 'required|integer',
      'detalle.*.idservicio': 'required|integer',
      'detalle.*.precio': 'required|numeric',
      'detalle.*.comentario': 'string|max:100',
      'detalle.*.descuento': 'required|numeric',
      'detalle.*.total': 'required|numeric',
      'detalle.*.estado': 'required|integer',
      'detalle_producto.*.idproducto': 'required|integer',
      'detalle_producto.*.cantidad': 'required|numeric',
      'detalle_producto.*.precio_venta': 'required|numeric',
      'detalle_producto.*.tipo_precio': 'required|numeric',
    };
  }else if (body.detalle != "" && body.detalle_producto == "") {
    rules = {
      idempleado: 'required|integer',
      idtaller: 'required|integer',
      total: 'required|numeric',
      fecha_inicio: 'required|date',
      fecha_entrega: 'required|date',
      tipo: 'required|integer',
      idusuario: 'required|integer',
      estado: 'integer',
      descripcion: 'string|max:255',
      referencia: 'required|string|max:100',
      idsucursal: 'required|integer',
      'detalle.*.idservicio': 'required|integer',
      'detalle.*.precio': 'required|numeric',
      'detalle.*.comentario': 'string|max:100',
      'detalle.*.descuento': 'required|numeric',
      'detalle.*.total': 'required|numeric',
      'detalle.*.estado': 'required|integer'
    }
  }
let validation = new Validator(body, rules);
  if (validation.passes()) {
  var data = {
    idorden: null,
    idempleado: body.idempleado,
    idtaller: body.idtaller,
    total: body.total,
    fecha_inicio: body.fecha_inicio,
    fecha_entrega: body.fecha_entrega,
    tipo: body.tipo,
    idusuario: body.idusuario,
    estado: 1,
    descripcion: body.descripcion,
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

  var datade = body.detalle;
  var data_producto = body.detalle_producto;
  console.log("Detalle de servicios");
  console.log(datade);
  console.log("Detalle de productos");
  console.log(data_producto);


  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }

    if (datade =="") {//Verificacion del detalle de servicios
      if (data_producto == "") {//Si no tiene productos
        callback(null, {
          statusCode: 500,
          headers: {

            'Access-Control-Allow-Origin': '*',

            'Access-Control-Allow-Credentials': true,

          },
          body: JSON.stringify({
            message: 'No se puede insertar una orden sin detalle de orden o productos'
          })
        })
      }else{
        callback(null, {
          statusCode: 500,
          headers: {

            'Access-Control-Allow-Origin': '*',

            'Access-Control-Allow-Credentials': true,

          },
          body: JSON.stringify({message:'No se puede insertar una orden sin detalle de orden o productos'})
        })
      }

    }//final del if para verificacion del detalle de servicios
    else{//Else para cuando si existan servicios
      if (data_producto=="") {
        connection.query('INSERT INTO pos.orden SET ?', [data], function (error, results, fields) {
          if (error) {
            return connection.rollback(function () {
              throw error;
            });
          }
          idG = results.insertId;
          let sql = datade.map(item => `(${idG},${item.idservicio}, ${item.precio}, ${"'"}${item.comentario}${"'"}, ${item.descuento}, ${item.total}, ${item.estado})`)
          //array with items.
          //console.log(sql);
          const finalQuery = "INSERT INTO pos.detalle_orden (idorden,idservicio, precio, comentario, descuento,total,estado) VALUES " + sql
          //console.log(finalQuery)
          //console.log("query("+finalQuery+")")

          connection.query(finalQuery, function (error, results, fields) {
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
                    message: 'orden y detalle de orden insertados correctamente',
                    id: idG
                  })
                })
              }
            }); //Fin commit
          })//final Query del detalle de orden
        })//fin query para insertar la orden
      }else{//si lleva ambos detalles
        connection.query('INSERT INTO pos.orden SET ?', [data], function (error, results, fields) {
          if (error) {
            return connection.rollback(function () {
              throw error;
            });
          }
    
          idG = results.insertId;
    
          let sql = datade.map(item => `(${idG},${item.idservicio}, ${item.precio}, ${"'"}${item.comentario}${"'"}, ${item.descuento}, ${item.total}, ${item.estado})`)
          //array with items.
          //console.log(sql);
          const finalQuery = "INSERT INTO pos.detalle_orden (idorden,idservicio, precio, comentario, descuento,total,estado) VALUES " + sql
          //console.log(finalQuery)
          //console.log("query("+finalQuery+")")
    
          connection.query(finalQuery, function (error, results, fields) {
            if (error) {
              return connection.rollback(function () {
                throw error;
              });
            }
            //codigo para armar la query del detalle de producto
            let sql = data_producto.map(item => `(${idG},${item.idproducto}, ${item.cantidad}, ${item.precio_venta}, ${item.tipo_precio})`)
    
            console.log("valores de los articulos que se venderan en la orden");
            console.log(sql);
            const finalQuery2 = "INSERT INTO pos.detalle_producto (idorden,idproducto, cantidad, precio_venta, tipo_precio) VALUES " + sql
    
    
            console.log(finalQuery2)
            //console.log("query("+finalQuery+")")
            connection.query(finalQuery2, function (error, results, fields) { //Query para agregar el detalle de producto
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
                      message: 'orden, detalle de orden y detalle de producto insertados correctamente',
                      id: idG
                    })
                  })
                }
              }); //Fin commit
            }); //fin del query para el detalle de producto
          }); //fin del query para el detalle de orden
          //final del if por si se hace insersion de orden sin producto
        }); //final query principal
      }
    }
  }); //final begin transaction
    
 
  }//final del if para la validacion
  else{
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
//--fin crear orden

//crear cliente

module.exports.createClient = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
  
  var rules = {}

  if(body.tipo == 1){
  rules = {
    nombre: 'required|string|max:255',
    nit: 'required|string|max:45',
    telefono1: 'string|max:15',
    telefono2: 'string|max:15',
    direccion: 'string|max:255',
    idmunicipio: 'integer',
    iddepartamento: 'integer',
    email: 'email|max:45',
    fecha_ingreso: 'date',
    tipo: 'required|integer',
    cui_individual: 'string|max:13',
    fecha_nac_individual: 'date',
    sexo_individual: 'string'
  };
}else if (body.tipo == 2) {
  rules = {
    nombre: 'required|string|max:255',
    nit: 'required|string|max:45',
    telefono1: 'string|max:15',
    telefono2: 'string|max:15',
    direccion: 'string|max:255',
    idmunicipio: 'integer',
    iddepartamento: 'integer',
    email: 'email|max:45',
    fecha_ingreso: 'date',
    tipo: 'required|integer',
    actividad_economica_juridico: 'string|max:100',
    fecha_inicio_op_juridico: 'date'
  }
}
let validation = new Validator(body, rules);
  if (validation.passes()) {

  if (body.tipo == 1) {
    var data = {
      idcliente: null,
      nombre: body.nombre,
      nit: body.nit,
      telefono1: body.telefono1,
      telefono2: body.telefono2,
      direccion: body.direccion,
      idmunicipio: body.idmunicipio,
      iddepartamento: body.iddepartamento,
      email: body.email,
      fecha_ingreso: body.fecha_ingreso,
      tipo: body.tipo,
      cui_individual: body.cui_individual,
      fecha_nac_individual: body.fecha_nac_individual,
      sexo_individual: body.sexo_individual
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

  } else if (body.tipo == 2) {
    var data = {
      idcliente: null,
      nombre: body.nombre,
      nit: body.nit,
      telefono1: body.telefono1,
      telefono2: body.telefono2,
      direccion: body.direccion,
      idmunicipio: body.idmunicipio,
      iddepartamento: body.iddepartamento,
      email: body.email,
      fecha_ingreso: body.fecha_ingreso,
      tipo: body.tipo,
      actividad_economica_juridico: body.actividad_economica_juridico,
      fecha_inicio_op_juridico: body.fecha_inicio_op_juridico
    };

    for (var clave in data) {
      // Controlando que json realmente tenga esa propiedad
      if (data.hasOwnProperty(clave)) {
        // Mostrando en pantalla la clave junto a su valor
        if (data[clave] == "") {
          data[clave] = null;
        }
      }
    }

  }

  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }
    connection.query('INSERT INTO cliente SET ?', [data], function (error, results, fields) {
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      idG = results.insertId;

      connection.commit(function (err) { ///
        console.log("Mensaje desde el commit");
        if (err) {
          return connection.rollback(function () {
            throw err;
          });
        } else if (body.tipo == 1) {
          callback(null, {
            statusCode: 200,
            headers: {

              'Access-Control-Allow-Origin': '*',

              'Access-Control-Allow-Credentials': true,

            },
            body: JSON.stringify({
              message: 'Cliente individual insertado correctamente',
              id: idG
            })
          })
        } else if (body.tipo == 2) {
          callback(null, {
            statusCode: 200,
            headers: {

              'Access-Control-Allow-Origin': '*',

              'Access-Control-Allow-Credentials': true,

            },
            body: JSON.stringify({
              message: 'Cliente juridico insertado correctamente',
              id: idG
            })
          })
        }
        //--------------------------------
      }); //Fin commit





    }); //final query principal
  }); //final begin transaction
  }//fin de la validacion de los datos
  else{
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

module.exports.createProvider = (event, context, callback) => { //crear proveedor
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
  //--------------------------
  var rules = {
    nombre: 'required|string|max:255',
    nit: 'required|string|max:15',
    telefono1: 'required|string|max:20',
    telefono2: 'string|max:20',
    direccion: 'required|string|max:255',
    idmunicipio: 'required|integer',
    iddepartamento: 'required|integer'
  };
  
  let validation = new Validator(body, rules);
  if (validation.passes()) {
  //--------------------------
  var data = {
      idproveedor: null,
      nombre: body.nombre,
      nit: body.nit,
      telefono1: body.telefono1,
      telefono2: body.telefono2,
      direccion: body.direccion,
      idmunicipio: body.idmunicipio,
      iddepartamento: body.iddepartamento
  };
  // Obteniendo todas las claves del JSON



  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }
    connection.query('INSERT INTO proveedor SET ?',[data], function (error, results, fields) {
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      idG = results.insertId;

      connection.commit(function (err) { ///
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
              message: 'proveedor insertado correctamente',
              id: idG
            })
          })
        }

        //--------------------------------
      }); //Fin commit





    }); //final query principal
  }); //final begin transaction
  }//fin de la validacion de los datos
  else{
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
}//Fin de la funcion

module.exports.findProviders = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false; //Para que no devuelva un timeOut porque no va a sber cuando han retornado la info

  const sql = 'SELECT * FROM pos.proveedor';

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
          proveedores: rows
        })
      }) //final rows
    }
  })
};//Fin de la funcion para encontrar proveedores

module.exports.createCategory = (event, context, callback) => { //crear categoria
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);

  var rules = {
    nombre_categoria: 'required|string|max:45'
  };
  
  let validation = new Validator(body, rules);
  if (validation.passes()) {

  var data = {
    idcategoria: null,
    nombre_categoria: body.nombre_categoria
  };
  // Obteniendo todas las claves del JSON



  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }
    connection.query('INSERT INTO categoria SET ?', [data], function (error, results, fields) {
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      idG = results.insertId;

      connection.commit(function (err) { ///
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
              message: 'categoria insertada correctamente',
              id: idG
            })
          })
        }

        //--------------------------------
      }); //Fin commit





    }); //final query principal
  }); //final begin transaction
  }//final de la validacion
else{
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
module.exports.createBrand = (event, context, callback) => { //crear marca
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
  var rules = {
    nombre_marca: 'required|string|max:45',
  };
  let validation = new Validator(body, rules);
  
  if (validation.passes()) {
  var data = {
    idmarca: null,
    nombre_marca: body.nombre_marca,
  };
  // Obteniendo todas las claves del JSON



  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }
    connection.query('INSERT INTO marca SET ?', [data], function (error, results, fields) {
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      idG = results.insertId;

      connection.commit(function (err) { ///
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
              message: 'Marca insertada correctamente',
              id: idG
            })
          })
        }

        //--------------------------------
      }); //Fin commit





    }); //final query principal
  }); //final begin transaction
  }//fin de la validacion de los datos
  else{
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
module.exports.updateProduct = (event, context, callback) => { //No desarrollado
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
//----------------------------------------
var rules = {
  idproducto: 'required|integer',
  codigo: 'required|string|max:45',
  nombre: 'required|string|max:45',
  descripcion: 'required|string|max:255',
  idmarca: 'required|integer',
  idcategoria: 'required|integer',
  modelo: 'string|max:45',
  talla: 'string|max:5',
  min: 'integer',
  max: 'integer',
  costo: 'required|numeric',
  estado: 'integer',
  linea: 'string|max:45',
  observacion: 'string|max:60'
};

  
let validation = new Validator(body, rules);
  if (validation.passes()) {
//----------------------------------------

  var data = {
    idproducto: body.idproducto,
    codigo: body.codigo,
    nombre: body.nombre,
    descripcion: body.descripcion,
    idmarca: body.idmarca,
    idcategoria: body.idcategoria,
    modelo: body.modelo,
    talla: body.talla,
    min: body.min,
    max: body.max,
    costo: body.costo,
    estado: body.estado,
    linea: body.linea,
    observacion: body.observacion
  };
  // Obteniendo todas las claves del JSON



  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }
    connection.query('UPDATE pos.producto SET ? WHERE pos.producto.idproducto = ?', [data,data.idproducto], function (error, results, fields) {
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      idG = results.insertId;

      connection.commit(function (err) { ///
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
              message: 'producto actualizado correctamente',
              id: idG
            })
          })
        }

        //--------------------------------
      }); //Fin commit





    }); //final query principal
  }); //final begin transaction
  }//final de la validacion
  else{
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
module.exports.createProduct = (event, context, callback) => { //No desarrollado
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);
//----------------------------------------
var rules = {
  codigo: 'required|string|max:45',
  nombre: 'required|string|max:45',
  descripcion: 'required|string|max:255',
  idmarca: 'required|integer',
  idcategoria: 'required|integer',
  modelo: 'string|max:45',
  talla: 'string|max:5',
  min: 'integer',
  max: 'integer',
  costo: 'required|numeric',
  estado: 'integer',
  linea: 'string|max:45',
  observacion: 'string|max:60'
};

  
let validation = new Validator(body, rules);
  if (validation.passes()) {
//----------------------------------------

  var data = {
    idproducto: null,
    codigo: body.codigo,
    nombre: body.nombre,
    descripcion: body.descripcion,
    idmarca: body.idmarca,
    idcategoria: body.idcategoria,
    modelo: body.modelo,
    talla: body.talla,
    min: body.min,
    max: body.max,
    costo: body.costo,
    estado: body.estado,
    linea: body.linea,
    observacion: body.observacion
  };
  // Obteniendo todas las claves del JSON



  connection.beginTransaction(function (err) {
    var idG;
    if (err) {
      throw err;
    }
    connection.query('INSERT INTO producto SET ?', [data], function (error, results, fields) {
      if (error) {
        return connection.rollback(function () {
          throw error;
        });
      }

      idG = results.insertId;

      connection.commit(function (err) { ///
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
              message: 'producto insertado correctamente',
              id: data.idproducto
            })
          })
        }

        //--------------------------------
      }); //Fin commit





    }); //final query principal
  }); //final begin transaction
  }//final de la validacion
  else{
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
/*crear cliente

module.exports.createClient = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const body = JSON.parse(event.body);

  if (body.tipo == 1) {
    var data = {
      idcliente: null,
      nombre: body.nombre,
      nit: body.nit,
      telefono1: body.telefono1,
      telefono2: body.telefono2,
      direccion: body.direccion,
      idmunicipio: body.idmunicipio,
      iddepartamento: body.iddepartamento,
      email: body.email,
      fecha_ingreso: "2020-10-10",
      tipo: body.tipo
    };

    var data2 = {
      apellido: body.apellido,
      cui: body.cui,
      fecha_nac: body.fecha_nac,
      sexo: body.sexo
    };
    // Obteniendo todas las claves del JSON
for (var clave in data){
    // Controlando que json realmente tenga esa propiedad
    if (data.hasOwnProperty(clave)) {
      // Mostrando en pantalla la clave junto a su valor
      if (data[clave]=="") {
        data[clave] = null;
      }
    }
  }
  // Obteniendo todas las claves del JSON
for (var clave in data2){
    // Controlando que json realmente tenga esa propiedad
    if (data2.hasOwnProperty(clave)) {
      // Mostrando en pantalla la clave junto a su valor
      if (data2[clave]=="") {
        data2[clave] = null;
      }
    }
  }
  } else if (body.tipo == 2) {
    var data = {
      idcliente: null,
      nombre: body.nombre,
      nit: body.nit,
      telefono1: body.telefono1,
      telefono2: body.telefono2,
      direccion: body.direccion,
      idmunicipio: body.idmunicipio,
      iddepartamento: body.iddepartamento,
      email: body.email,
      fecha_ingreso: "2020-10-10",
      tipo: body.tipo
    };

    var data2 = {
      actividad_economica: body.actividad_economica,
      fecha_inicio: body.fecha_inicio
    };

    for (var clave in data){
        // Controlando que json realmente tenga esa propiedad
        if (data.hasOwnProperty(clave)) {
          // Mostrando en pantalla la clave junto a su valor
          if (data[clave]=="") {
            data[clave] = null;
          }
        }
      }
      // Obteniendo todas las claves del JSON
    for (var clave in data2){
        // Controlando que json realmente tenga esa propiedad
        if (data2.hasOwnProperty(clave)) {
          // Mostrando en pantalla la clave junto a su valor
          if (data2[clave]=="") {
            data2[clave] = null;
          }
        }
      }
  }

  connection.beginTransaction(function(err) {
    var idG;
  if (err) { throw err; }
  connection.query('INSERT INTO cliente SET ?', [data], function (error, results, fields) {
    if (error) {
      return connection.rollback(function() {
        throw error;
      });
    }

    //var log = 'Post ' + results.insertId + ' added';
    //-------------------------------------

      idG =  results.insertId;
    //-------------------------------------
    if (body.tipo == 1) {
      connection.query('INSERT INTO individual values(?,?,?,?,?)', [idG,data2.apellido,data2.cui,data2.fecha_nac,data2.sexo], function (error, results, fields) {
        if (error) {
          return connection.rollback(function() {
            throw error;
          });
        }

              connection.query('INSERT INTO cliente_individual values(?,?)',[idG,idG], function (error, results, fields) {
                if (error) {
                  //console.log("Error en cliente_individual"+idG);
                  return connection.rollback(function() {
                    throw error;
                  });

                }
                            connection.commit(function(err) {///
                              console.log("Mensaje desde el commit");
                              if (err) {
                                return connection.rollback(function() {
                                  throw err;
                                });
                              }else {
                                     callback(null, {
                                     statusCode: 200,
                                     body: JSON.stringify({
                                     message: 'Cliente individual insertado correctamente',
                                     id: idG
                                      })
                                    })
                                    }
                              //--------------------------------
                            });//Fin commit
                });//final query cliente_individual

      });//final query individual
    } else if (body.tipo == 2) {
      connection.query('INSERT INTO juridico values(?,?,?)', [idG,data2.actividad_economica,data2.fecha_inicio], function (error, results, fields) {
        if (error) {
          return connection.rollback(function() {
            throw error;
          });
        }

              connection.query('INSERT INTO cliente_juridico values(?,?)',[idG,idG], function (error, results, fields) {
                if (error) {
                  //console.log("Error en cliente_individual"+idG);
                  return connection.rollback(function() {
                    throw error;
                  });

                }
                            connection.commit(function(err) {///
                              //console.log("Mensaje desde el commit");
                              if (err) {
                                return connection.rollback(function() {
                                  throw err;
                                });
                              }else {
                                     callback(null, {
                                     statusCode: 200,
                                     body: JSON.stringify({
                                     message: 'Cliente juridico insertado correctamente',
                                     id: idG
                                      })
                                    })
                                    }
                              //--------------------------------
                            });//Fin commit
                });//final query cliente_individual

      });//final query individual
    }





  });//final query principal
});//final begin transaction


};//final de la funcion*/

//-------------------------------------------------------------
module.exports.create = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = queryString.parse(event['body']);
  const data = {
    todo: body.todo,
    todoscol2: body.todoscol2
  };

  //Funcion lambda por terminar
  const sql = 'INSERT INTO todos SET ?';
  connection.query(sql, [data], (error, result) => {
    if (error) {
      callback({
        statusCode: 500,
        body: JSON.stringify(error)
      })
    } else {
      callback(null, {
        statusCode: 200,
        headers: {

          'Access-Control-Allow-Origin': '*',

          'Access-Control-Allow-Credentials': true,

        },
        body: JSON.stringify({
          res: `Insetado correctamente con id ${result.insertId}`
        })
      })
    }
  })
}; //-----------------------------------------

module.exports.update = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const body = queryString.parse(event['body']);

  const sql = 'UPDATE todos SET todo = ? WHERE idtodos = ?';
  connection.query(sql, [body.todo, event.pathParameters.todo], (error, result) => {
    if (error) {
      callback({
        statusCode: 500,
        body: JSON.stringify(error)
      })
    } else {
      callback(null, {
        statusCode: 200,
        headers: {

          'Access-Control-Allow-Origin': '*',

          'Access-Control-Allow-Credentials': true,

        },
        body: JSON.stringify({
          res: `Todo actualizado correctamente`
        })
      })
    }
  })
};

module.exports.delete = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const sql = 'DELETE from todos WHERE idtodos = ?';
  connection.query(sql, [event.pathParameters.todo], (error, result) => {
    if (error) {
      callback({
        statusCode: 500,
        body: JSON.stringify(error)
      })
    } else {
      callback(null, {
        statusCode: 200,
        headers: {

          'Access-Control-Allow-Origin': '*',

          'Access-Control-Allow-Credentials': true,

        },
        body: JSON.stringify({
          res: `Todo eliminado correctamente`
        })
      })
    }
  })
};

/*
Campos
idproducto
codigo**
nombre**
descripcion**
idmarca**
idcategoria = clasificacion**
modelo = linea
talla
min
max
precio_minimo**
precio_maximo**
precio_especial
costo**
estado
INSERT INTO `pos`.`producto` (`codigo`, `nombre`, `descripcion`, `idmarca`, `idcategoria`, `precio_minimo`, `precio_maximo`, `costo`) VALUES ('1234', 'test', 'test', '1', '1', '200', '500', '100');
*/
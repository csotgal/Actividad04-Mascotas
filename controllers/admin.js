const Pedido = require('../models/pedido');
const Producto = require('../models/producto');
const Usuario = require('../models/usuario')

const {validationResult} =require('express-validator')
//Administracion de Productos

exports.getProductos = (req, res,next) => {

    Producto
        .find()
        .then((productos) => {
            res.render('admin/productos', {
                prods: productos,
                titulo: "Administracion de Productos",
                path: "/admin/productos",
                autenticado: req.session.autenticado
            });
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.getCrearProducto = (req, res,next) => {
    res.render('admin/crear-editar-producto', {
        titulo: 'Crear Producto',
        path: '/admin/crear-producto',
        autenticado: req.session.autenticado,
        modoEdicion: false,
        mensajeError : null,
        tieneError:false,
        erroresValidacion:[]
    })
};

exports.postCrearProducto = (req, res,next) => {

    const nombre = req.body.nombre;
    const urlImagen = req.body.urlImagen;
    const precio = parseFloat(req.body.precio);
    const descripcion = req.body.descripcion;
    const categoria = req.body.categoria;
    const color = req.body.color;


    const errors= validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/crear-editar-producto', {
          path: '/admin/crear-editar-producto',
          titulo: 'Producto admin',
          mensajeError: errors.array()[0].msg,
          modoEdicion:false,
          tieneError:true,
          erroresValidacion: errors.array(),
        
          producto: {
            nombre: nombre,
            urlImagen: urlImagen,
            descripcion: descripcion,
            precio: precio,
            categoria: categoria,
            color: color,
            idUsuario: req.usuario._id
          },
        });
      }

    const producto = new Producto({
        nombre: nombre,
        urlImagen: urlImagen,
        descripcion: descripcion,
        precio: precio,
        categoria: categoria,
        color: color,
        idUsuario: req.usuario._id
    });

    if (req.usuario.role !== 'admin') {
        return res.redirect('/');
    }
    producto
        .save()
        .then((result) => {
            console.log(result);
            console.log('Producto creado');
            res.redirect('/admin/productos');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditarProducto = (req, res,next) => {
    const modoEdicion = req.query.editar;
    const idProducto = req.params.idProducto;

    Producto.findById(idProducto)
        .then((producto) => {
            
            res.render('admin/crear-editar-producto', {
                titulo: 'Editar Producto',
                path: '/admin/editar-producto',
                producto: producto,
                modoEdicion: true,
                autenticado: req.session.autenticado,
                mensajeError : null,
                tieneError:false,
                erroresValidacion:[]
            })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

exports.postEditarProducto = (req, res, next) => {
    const idProducto = req.body.idProducto;
    const nombre = req.body.nombre;
    const precio = parseFloat(req.body.precio);
    const urlImagen = req.body.urlImagen;
    const descripcion = req.body.descripcion;
    const categoria = req.body.categoria;
    const color = req.body.color;

    const errors= validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/crear-editar-producto', {
          path: '/admin/crear-editar-producto',
          titulo: 'Producto admin',
          mensajeError: errors.array()[0].msg,
          modoEdicion:false,
          tieneError:true,
          erroresValidacion: errors.array(),
        
          producto: {
            nombre: nombre,
            urlImagen: urlImagen,
            descripcion: descripcion,
            precio: precio,
            categoria: categoria,
            color: color,
            _id:idProducto
          },
        });
      }

    Producto.findById(idProducto)
        .then((producto) => {
            if (req.usuario.role !== 'admin') {
                return res.redirect('/');
            }
            producto.nombre = nombre;
            producto.urlImagen = urlImagen;
            producto.descripcion = descripcion;
            producto.precio = precio;
            producto.categoria = categoria;
            producto.color = color;
            return producto.save();
        })
        .then((result) => {
            console.log('Producto guardado');
            res.redirect('/admin/productos');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEliminarProducto = (req, res, next) => {

    const idProducto = req.body.idProducto;

    Producto.deleteOne({_id: idProducto, role: 'admin'})
        .then((result) => {
            console.log('Producto eliminado');
            res.redirect('/admin/productos');
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};


// Administracion de usuarios 
exports.getUsuarios = (req, res,next) => {
    Usuario.find()
        .then((usuarios) => {
            res.render('admin/usuarios', {
                users: usuarios,
                titulo: "Administracion de Usuarios",
                path: "/admin/usuarios",
                autenticado: req.session.autenticado
            });
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

};

exports.getCrearUsuario = (req, res,next) => {
    if (req.usuario.role !== 'admin') {
        return res.redirect('/');
    }
    res.render('admin/crear-editar-usuario', {
        titulo: 'Crear usuario',
        path: '/crear-usuario',
        modoEdicion: false,
        autenticado: req.session.autenticado
    })
};

exports.postCrearUsuario = (req, res,next) => {

    const nombre = req.body.nombre;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    const usuario = new Usuario({
        nombre: nombre,
        email: email,
        password: password,
        role: role,
        carrito: { items: [], precioTotal: 0 }
    });

    usuario
        .save()
        .then((result) => {
            console.log('Usuario creado');
            res.redirect('/admin/usuarios');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

exports.getEditarUsuario = (req, res,next) => {

    const idUsuario = req.params.idUsuario;
    Usuario.findById(idUsuario)
        .then((usuario) => {
            if (!usuario) {
                return res.redirect('/admin/usuarios');
            }
            res.render('admin/crear-editar-usuario', {
                titulo: 'Editar Usuario',
                path: '/admin/editar-usuario',
                usuario: usuario,
                modoEdicion: true,
                autenticado: req.session.autenticado
            })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}

exports.postEditarUsuario = (req, res, next) => {

    const idUsuario = req.body.idUsuario;
    const nombre = req.body.nombre;
    const email = req.body.email;
    // const password = req.body.password;
    const role = req.body.role;

    Usuario.findById(idUsuario)
        .then((usuario) => {
            if (req.usuario.role !== 'admin') {
                return res.redirect('/');
            }
            usuario.nombre = nombre;
            usuario.email = email;
            usuario.role = role;
            return usuario.save();
        })
        .then((result) => {
            console.log('Usuario guardado');
            res.redirect('/admin/usuarios');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEliminarUsuario = (req, res, next) => {

    const idUsuario = req.body.idUsuario;

    Usuario.findByIdAndDelete(idUsuario)
        .then((result) => {
            if (req.usuario.role !== 'admin') {
                return res.redirect('/');
            }
            console.log('Usuario eliminado');
            res.redirect('/admin/usuarios');
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

}


exports.getPedidos = (req, res,next) => {

    Pedido
        .find()
        .then((pedidos) => {
            res.render('admin/pedidos', {
                path: '/admin/pedidos',
                titulo: 'Todos los pedidos',
                pedidos: pedidos,
                autenticado: req.session.autenticado
            })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditarPedido = (req, res,next) => {
    const idPedido = req.params.idPedido;
    console.log(idPedido)

    Pedido.findById(idPedido)
        .then((pedido) => {
            if (!pedido) {
                return res.redirect('/admin/pedidos');
            }
            res.render('admin/editar-pedido', {
                titulo: 'Editar Pedido',
                path: '/admin/editar-pedido',
                pedido: pedido,
                autenticado: req.session.autenticado
            })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

exports.postEditarPedido = (req, res, next) => {
    const idPedido = req.body.idPedido;
    const estado = req.body.estado;
    const fechaEntrega = req.body.fechaEntrega;
    const precioTotal = req.body.precioTotal;

    Pedido.findById(idPedido)
        .then((pedido) => {
            if (req.usuario.role !== 'admin') {
                return res.redirect('/');
            }

            for (let i = 0; i < pedido.productos.length; i++) {
                const nuevaCantidad = parseInt(req.body[`cantidadProducto${i}`], 10);
                const cantidadAnterior = pedido.productos[i].cantidad;

                if (!isNaN(nuevaCantidad)) {
                    // actualizar cantidad de cada producto
                    pedido.productos[i].cantidad = nuevaCantidad;
                }

                const precio = pedido.productos[i].producto.precio;
                pedido.precioTotal = pedido.precioTotal - precio * cantidadAnterior + precio * nuevaCantidad;
            }

            pedido.estado = estado;
            pedido.fechaEntrega = fechaEntrega;
            return pedido.save();
        })
        .then((result) => {
            console.log('Pedido guardado');
            res.redirect('/admin/pedidos');
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}
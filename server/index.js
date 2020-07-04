import app from '../index'
import mongoose from 'mongoose'

const {PORT, DB_CONNECTION} = process.env;

mongoose
    .connect(DB_CONNECTION, {useNewUrlParser:true, useCreateIndex:true, useFindAndModify:false})
    .then(() => console.log('u are connected to DB'))
    .catch( (e) => console.log(e));

process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1);
    })
})
app.listen(PORT, () => console.log(`u are listening to ${PORT} port`));


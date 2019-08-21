const { admin, db } = require('../utils/admin');
const { uploadImage, getFormData } = require('../utils/formData');


exports.getDeposits = (req, res) => {
    db.collection('deposits')
      .orderBy('createdAt', 'desc')
      .get()
      .then((data) => {
        let deposits = [];
        data.forEach((doc) => {
            const docData = doc.data();
            if(!docData.markDeleted){
                deposits.push({
                    docid: doc.id,
                    amount: docData.amount,
                    month: docData.month,
                    year: docData.year,
                    user: docData.user,
                    imageUrl: docData.imageUrl,
                    approved: docData.approved,
                    approvedBy: docData.approvedBy,
                    approvedDate: docData.approvedDate
                });
            }
        });
        return res.json(deposits);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
  };

exports.createDeposit = (req, res) => {

  getFormData(req, (formData) => {
    console.log('formdata: ' + formData);

    var depositData = {
        amount : parseFloat( formData.amount || 0),
        month : parseInt( formData.month || (new Date()).getMonth()),
        year : parseInt( formData.year || (new Date()).getFullYear()),
        user : req.user.handle,
        createdAt: new Date().toISOString(),
        approved : false
    };

    const funcCreateDeposit = (data) => {
        return db.collection('deposits')
                .add(data)
                .then((doc) => {
                    data.docid = doc.id;
                    return res.status(201).json(data);
                })
                .catch((err) => {
                    res.status(500).json({ error: 'something went wrong' });
                    console.error(err);
                });
    };

    if(formData.image){
        uploadImage(formData.image)
        .then(fileInfo => {
            depositData.imageUrl = fileInfo.imageUrl;
            return funcCreateDeposit(depositData);
        })
        .catch((err) => {
            res.status(500).json({ error: 'something went wrong' });
            console.error(err);
        });
    } else{
        funcCreateDeposit(data);
    }
  });
};

exports.updateDeposit = (req, res) => {
    let depositData = {};
    const reqData = req.body;
    
    if(reqData.amount !== undefined){
        depositData.amount = parseFloat(reqData.amount);
    }

    if(reqData.month !== undefined){
        depositData.month = parseInt(reqData.month);
    }

    if(reqData.year !== undefined){
        depositData.year = parseInt(reqData.year);
    }

    if(reqData.approved){
        depositData.approved = reqData.approved;
        depositData.approvedBy = req.user.handle;
        depositData.approvedDate = new Date().toISOString();
    }

    if(reqData.markDeleted){
        depositData.markDeleted = reqData.markDeleted;
    }
    
    db.doc(`/deposits/${req.params.docid}`)
        .update(depositData)
        .then(() => {
            return res.json({ message: 'deposit updated successfully' });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
  
  };



new CategoryModel({
    name: 'Sporty wodne',
}).save(function(err,category) {
    new ProductModel({
        categoryId: category.id,
        name: 'Kajak',
        description: 'Łódka dla jednej osoby',
        price: {
            value: 150,
            currency: 'USD'
        }
    }).save();
    new ProductModel({
        categoryId: category.id,
        name: 'Wiosło',
        description: 'Kijek do napędu',
        price: {
            value: 40,
            currency: 'USD'
        }
    }).save();
});

new CategoryModel({
    name: 'Piłka nożna',
}).save(function(err, category){
    new ProductModel({
        categoryId: category.id,
        name: 'Piłka',
        description: 'Od lewandowskiego',
        price: {
            value: 150,
            currency: 'USD'
        }
    }).save();
});



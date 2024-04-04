export const BASE_URL = 'https://api.sosocare.com/v1/';
// export const BASE_URL = 'http://172.20.10.5:5000/v1/';

// RETURN IMAGE PATH SERVICE
export interface WasteImage {
    name: string;
    img: any;
}
export class WasteImageService {
    private static images: Array<WasteImage> = [
        {
            name: 'batteries',
            img: require('../../assets/wastes/batteries.png')
        },
        {
            name: 'metal',
            img: require('../../assets/wastes/metal.png')
        },
        {
            name: 'hdpe',
            img: require('../../assets/wastes/hdpe.png')
        },
        {
            name: 'tin',
            img: require('../../assets/wastes/tin.png')
        },
        {
            name: 'carton',
            img: require('../../assets/wastes/carton.png')
        },
        {
            name: 'sachet_water',
            img: require('../../assets/wastes/sachet_water.png')
        },
        {
            name: 'white_nylon',
            img: require('../../assets/wastes/white_nylon.png')
        },
        {
            name: 'paper',
            img: require('../../assets/wastes/paper.png')
        },
        {
            name: 'steel',
            img: require('../../assets/wastes/steel.png')
        },
        {
            name: 'pet',
            img: require('../../assets/wastes/pet.png')
        },
    ];
    static GetImage = (name: string) => {
        const found = WasteImageService.images.find(e => e.name === name);
        return found ? found.img : null;
    };
}

export const getPrice = (title) => {
    let price = 0;
    let imageName = 'batteries';
    if (title === 'Batteries') {
        price = 2700;
    } else if (title === 'HDPE') {
        price = 3000;
        imageName = 'hdpe';
    } else if (title === 'Carton') {
        price = 1800;
        imageName = 'carton';
    } else if (title === 'Copper') {
        price = 4000;
    } else if (title === 'Tin') {
        price = 5000;
        imageName = 'tin';
    } else if (title === 'PET') {
        price = 1500;
        imageName = 'pet';
    } else if (title === 'Aluminium') {
        price = 5500;
    } else if (title === 'Steel') {
        price = 6000;
        imageName = 'steel';
    } else if (title === 'Paper') {
        price = 1500;
        imageName = 'paper';
    } else if (title === 'SachetWater') {
        price = 1000;
        imageName = 'sachet_water';
    } else if (title === 'White Nylon') {
        price = 2500;
        imageName = 'white_nylon';
    } else if (title === 'Metal') {
        price = 3000;
        imageName = 'metal';
    }

    return {
        imageName,
        price
    }
};
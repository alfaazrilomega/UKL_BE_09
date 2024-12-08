import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllInventory = async (req, res) => {
  try {
    const result = await prisma.inventory.findMany();
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};
export const getInventoryById = async (req, res) => {
  try {
    const result = await prisma.inventory.findUnique({
      where: {
        id_barang: Number(req.params.id),
      },
    });
    if (result) {
      res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "data not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error,
    });
  }
};

export const addInventory = async (req, res) => {
    try {
      const { nama_barang, kategori, lokasi, quantity  } = req.body;
  
      const itemCheck = await prisma.inventory.findFirst({
        where: {
          nama_barang : nama_barang
        },
      });
      if (itemCheck) {
        res.status(401).json({
          msg: "barang sudah ada",
        });
      } else {
        const result = await prisma.inventory.create({
          data: {
            nama_barang: nama_barang,
            category: kategori,
            location: lokasi,
            quantity: quantity,
          },
        });
        res.status(201).json({
          success: true,
          message: "Barang berhasil ditambah",
          data: result,
        });
      }
    } catch (error) {
      console.log(error);
      res.json({
        msg: error,
      });
    }
  };

export const updateInventory = async (req, res) => {
  try {
      const { nama_barang, kategori, lokasi, kuantitas } = req.body;
  
      const itemCheck = await prisma.inventory.findFirst({
        where: {
          id_barang: Number(req.params.id),
        },
      });
      if (!itemCheck) {
        res.status(401).json({
          msg: "barang TIDAK DITEMUKAN",
        });
      } else {
        const result = await prisma.inventory.update({
          data: {
            nama_barang: nama_barang,
            category: kategori,
            location: lokasi,
            quantity: kuantitas,
          },
          where: {
            id_barang: Number(req.params.id),
          },
        });
        res.status(201).json({
          success: true,
          message: "Barang berhasil ditambah",
          data: result,
        });
      }
    } catch (error) {
      console.log(error);
      res.json({
        msg: `Error: ${error.message}`,
      });
    }
  };

export const deleteInventory = async (req, res) => {
  try {
    const dataCheck = await prisma.inventory.findUnique({
      where: {
        id_barang: Number(req.params.id),
      },
    });
    if (!dataCheck) {
      res.status(401).json({
        msg: "data tidak ditemukan",
      });
    } else {
      const result = await prisma.inventory.delete({
        where: {
          id_barang: parseInt(req.params.id),
        },
      });
      res.json({
        success: true,
        message: "Data Barang berhasil dihapus",
        data: result,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      msg: error,
    });
  }
};

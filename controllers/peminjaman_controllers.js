import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllPeminjaman = async (req, res) => {
  try {
    const result = await prisma.peminjaman.findMany();
    const formattedData = result.map((record) => {
      const formattedBorrowDate = new Date(record.borrow_date)
        .toISOString()
        .split("T")[0];
      const formattedReturnDate = new Date(record.return_date)
        .toISOString()
        .split("T")[0];
      return {
        ...record,
        borrow_date: formattedBorrowDate,
        return_date: formattedReturnDate,
      };
    });

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching data.",
      error: error.message,
    });
  }
};

export const getPeminjamanById = async (req, res) => {
  try {
    const result = await prisma.peminjaman.findMany({
      where: {
        id_user: Number(req.params.id),
      },
    });
    const formattedData = result.map((record) => {
      const formattedBorrowDate = new Date(record.borrow_date)
        .toISOString()
        .split("T")[0];
      const formattedReturnDate = new Date(record.return_date)
        .toISOString()
        .split("T")[0];
      return {
        ...record,
        borrow_date: formattedBorrowDate,
        return_date: formattedReturnDate,
      };
    });

    if (formattedData.length > 0) {
      res.json({
        success: true,
        data: formattedData,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching data.",
      error: error.message,
    });
  }
};

export const addPeminjaman = async (req, res) => {
  const { user_id, item_id, borrow_date, return_date } = req.body;
  let qty = 1;

  if (!user_id || !item_id || !borrow_date || !return_date) {
      return res.status(400).json({
          status: 'error',
          message: 'Missing required fields'
      });
  }

  try {
      const newBorrow = await prisma.peminjaman.create({
          data: {
              id_user: parseInt(user_id),
              id_barang: parseInt(item_id),
              borrow_date: new Date(borrow_date),
              return_date: new Date(return_date),
              qty: Number(qty),
              status: 'dipinjam'
          }
      });

      return res.status(201).json({
          status: 'success',
          message: 'Item successfully borrowed',
          data: newBorrow
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({
          status: 'error',
          message: 'Internal server error'
      });
  }
};

export const pengembalianBarang = async (req, res) => {
    const { id_peminjaman, return_date } = req.body;

    if (!id_peminjaman || !return_date) {
        return res.status(400).json({
            status: 'error',
            message: 'Missing required fields'
        });
    }

    try {
        const updatedBorrow = await prisma.peminjaman.update({
            where: {
                id_peminjaman: parseInt(id_peminjaman)
            },
            data: {
                return_date: new Date(return_date),
                status: 'kembali'
            },
            include: {
                user: true,
                barang: true
            }
        });

        return res.status(200).json({
            status: 'success',
            message: 'Pengembalian berhasil dicatat',
            data: {
                borrow_id: updatedBorrow.id_peminjaman,
                item_id: updatedBorrow.id_barang,
                user_id: updatedBorrow.id_user,
                actual_return_date: updatedBorrow.return_date
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

export const usageReport = async (req, res) => {
  const { start_date, end_date, category, location, group_by } = req.body;

  const formattedStartDate = new Date(start_date).toISOString();
  const formattedEndDate = new Date(end_date).toISOString();

  try {
    // Conditional filters for category and location
    const items = await prisma.inventory.findMany({
      where: {
        AND: [
          category ? { category: { contains: category } } : {},
          location ? { location: { contains: location } } : {},
        ],
      },
    });

    // Check if any items were found
    if (items.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No items found for the given filters.",
      });
    }

    // Get borrow records within the date range
    const borrowRecords = await prisma.peminjaman.findMany({
      where: {
        borrow_date: { gte: formattedStartDate },
        return_date: { lte: formattedEndDate },
      },
    });

    const validGroupBy = ["category", "location"];
    if (!validGroupBy.includes(group_by)) {
      return res.status(400).json({
        status: "fail",
        message: `Invalid group_by value. Must be one of: ${validGroupBy.join(", ")}`,
      });
    }

    // Group data based on item category
    const analysis = items.map((item) => {
      const relevantBorrows = borrowRecords.filter(
        (record) => record.id_barang === item.id_barang
      );

      const totalBorrowed = relevantBorrows.reduce(
        (sum, record) => sum + record.qty,
        0
      );

      const totalReturned = relevantBorrows.reduce(
        (sum, record) => (record.status === "kembali" ? sum + record.qty : sum),
        0
      );

      return {
        item_id: item.id_barang,
        group: group_by === 'category' ? item.category : item.location, // Menggunakan group_by untuk menentukan nilai
        nama_barang: item.nama_barang,
        total_borrowed: totalBorrowed,
        total_returned: totalReturned,
        items_in_use: totalBorrowed - totalReturned,
      };
    });

    // Send the response with usage analysis
    res.status(200).json({
      status: "success",
      data: {
        analysis_period: {
          start_date,
          end_date,
          group_by,
        },
        usage_analysis: analysis,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing the usage report.",
      error: `${error}`,
    });
  }
};
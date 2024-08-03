'use client';

import { useState } from 'react';
import { AppBar, Toolbar, Tooltip, IconButton, Modal,Container, Typography, Box, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AppleIcon from '@mui/icons-material/Apple';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import SetMealIcon from '@mui/icons-material/SetMeal';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Snackbar, Alert } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { firestore, collection, addDoc, getDocs, deleteDoc, doc } from './firebase';


const theme = createTheme({
  typography: {
    fontFamily: "'Roboto', sans-serif",  // Change this to your desired font
    h2: {
      fontFamily: "'Arial'",  // Apply custom font to h2
      color: '#555555',
    },
    body1: {
      color: '#555555',
    },
  },
  palette: {
    primary: {
      main: '#dbb8f2',
    },
    secondary: {
      main: '#f5eeb0',
    },
    info: {
      main: '##f5eeb0',
    },
    background: {
      default: '#f5eddf', // Cream color
    },
    nd: {
      default: '#afdebc',
    },
    success: {
      main: '#afdebc',
    }
  },
});

export default function Home() {
  const [action, setAction] = useState(null);
  const [item, setItem] = useState({ name: '', quantity: '', category: '', expiry: '' });
  const [searchResult, setSearchResult] = useState(null);
  const [itemsByCategory, setItemsByCategory] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [fetchedRecipes, setFetchedRecipes] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [discardedItems, setDiscardedItems] = useState([]);


  const [open, setOpen] = useState(false);
   // Function to open the modal
   const handleOpen = () => setOpen(true);

   // Function to close the modal
   const handleClose = () => setOpen(false);

  // Function to fetch pantry items and get recipes
  const handleFetchRecipes = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'pantry'));
      const pantryItems = [];
      querySnapshot.forEach((doc) => {
        pantryItems.push(doc.data().name);
      });

      if (pantryItems.length > 0) {
        const ingredients = pantryItems.join(',');
        const response = await axios.get(`https://api.edamam.com/search?q=${ingredients}&app_id=e33ba68f&app_key=96a70e3a17d2a94ad8a6db26cf94a294`);
        setFetchedRecipes(response.data.hits.map(hit => hit.recipe));
      } else {
        setSnackbarMessage('No pantry items available to fetch recipes.');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setSnackbarMessage('Error fetching recipes');
      setSnackbarOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setItem({ ...item, [name]: value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const querySnapshot = await getDocs(collection(firestore, 'pantry'));
      const results = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().name.toLowerCase() === item.name.toLowerCase()) {
          results.push(doc.data());
        }
      });
      setSearchResult(results.length > 0 ? results[0] : 'Item not found');
    } catch (error) {
      console.error('Error searching for item:', error);
      setSearchResult('Error searching for item');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(firestore, 'pantry'), item);
      setSnackbarMessage('Added Item succesfully!');
      setSnackbarOpen(true);

    } catch (error) {
      console.error('Error adding item:', error);
      setSnackbarMessage('Error adding item');
      setSnackbarOpen(true);
      
    }
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    try {
      const querySnapshot = await getDocs(collection(firestore, 'pantry'));
      querySnapshot.forEach((document) => {
        if (document.data().name.toLowerCase() === item.name.toLowerCase()) {
          deleteDoc(doc(firestore, 'pantry', document.id));
        }
      });
      setSnackbarMessage('Item removed successfully!');
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error('Error removing item:', error);
      setSnackbarMessage('Error removing item');
      setSnackbarOpen(true);
    }
  };

  const handleButtonClick = (actionType) => {
    setAction(actionType);
    setSearchResult(null);
    setItemsByCategory([]);
    setItem({ name: '', quantity: '', category: '', expiry: '' });
  };

  const handleCategoryClick = async (category) => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'pantry'));
      let results = [];
      
      // Fetch all items or filter by category
      if (category.toLowerCase() === 'all') {
        querySnapshot.forEach((doc) => {
          results.push(doc.data());
        });
      } else {
        querySnapshot.forEach((doc) => {
          if (doc.data().category.toLowerCase() === category.toLowerCase()) {
            results.push(doc.data());
          }
        });
      }
      
      setItemsByCategory(results);
      setAction(null); // Clear the form action
      setSearchResult(null); // Clear the search result
      setItem({ name: '', quantity: '', category: '', expiry: '' }); // Clear the form inputs
    } catch (error) {
      console.error('Error fetching items by category:', error);
    }
  };
  

  const handleExpiringItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'pantry'));
      const today = new Date();
      const results = [];
      querySnapshot.forEach((doc) => {
        const expiryDate = new Date(doc.data().expiry);
        if (expiryDate < today) {
          results.push({ ...doc.data(), id: doc.id });
        }
      });
      setExpiringItems(results);
      setSnackbarMessage('Items discarded successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error fetching expiring items:', error);
    }
  };

  const handleDiscardExpiredItems = async () => {
    try {
      for (const item of expiringItems) {
        await deleteDoc(doc(firestore, 'pantry', item.id));
      }
      setExpiringItems([]);
      alert('Expired items discarded successfully!');
    } catch (error) {
      console.error('Error discarding expired items:', error);
      alert('Error discarding expired items');
    }
  };

  return (
    <div
      style={{
        backgroundImage: 'url(/background.jpg)', // Use the correct relative path
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <AppBar position="static">
          <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleOpen}>
            <MenuIcon />
            <Typography variant="body2" style={{ marginLeft: 8 }}>Guide</Typography>
          </IconButton>
            <Box display="flex" flexGrow={1} justifyContent="space-around">
              <Tooltip title="All">
                <IconButton edge="start" color="inherit" aria-label="all" onClick={() => handleCategoryClick('all')}>
                  <AllInboxIcon />
                  <Typography variant="body2" style={{ marginLeft: 8 }}>All</Typography>
                </IconButton>
              </Tooltip>
              <Tooltip title="Fruits">
                <IconButton edge="start" color="inherit" aria-label="fruits" onClick={() => handleCategoryClick('fruits')}>
                  <AppleIcon />
                  <Typography variant="body2" style={{ marginLeft: 8 }}>Fruits</Typography>
                </IconButton>
              </Tooltip>
              <Tooltip title="Veggies">
                <IconButton edge="start" color="inherit" aria-label="veggies" onClick={() => handleCategoryClick('veggies')}>
                  <EmojiNatureIcon />
                  <Typography variant="body2" style={{ marginLeft: 8 }}>Veggies</Typography>
                </IconButton>
              </Tooltip>
              <Tooltip title="Meat">
                <IconButton edge="start" color="inherit" aria-label="meat" onClick={() => handleCategoryClick('meat')}>
                  <SetMealIcon />
                  <Typography variant="body2" style={{ marginLeft: 8 }}>Meat</Typography>
                </IconButton>
              </Tooltip>
              <Tooltip title="Dairy">
                <IconButton edge="start" color="inherit" aria-label="dairy" onClick={() => handleCategoryClick('dairy')}>
                  <LocalDrinkIcon />
                  <Typography variant="body2" style={{ marginLeft: 8 }}>Dairy</Typography>
                </IconButton>
              </Tooltip>
              <Tooltip title="Others">
                <IconButton edge="start" color="inherit" aria-label="others" onClick={() => handleCategoryClick('others')}>
                  <MoreHorizIcon />
                  <Typography variant="body2" style={{ marginLeft: 8 }}>Others</Typography>
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
        <Container
          maxWidth="sm"
          style={{ marginTop: '25vh', padding: '20px', borderRadius: '8px', backgroundColor: '#fff' }}
        >
          <Typography variant="h2" align="center" gutterBottom sx={{ fontFamily: "'Georgia', serif" }}>
            Pantry Tracker
          </Typography>
          <Box display="flex" justifyContent="center" marginTop={2}>
            <Button variant="contained" color="success" onClick={() => handleButtonClick('search')} sx={{ mr: 2 }}>
              Search Item
            </Button>
            <Button variant="contained" color="success" onClick={() => handleButtonClick('add')} sx={{ mr: 2 }}>
              Add Item
            </Button>
            <Button variant="contained" color="success" onClick={() => handleButtonClick('remove')}>
              Remove Item
            </Button>
          </Box>
          <Box mt={2} p={2} border={1} borderColor="grey.400" borderRadius={4} bgcolor="white">
            {action && (
              <form onSubmit={action === 'search' ? handleSearch : action === 'add' ? handleAdd : handleRemove}>
                <TextField
                  name="name"
                  label="Enter item name"
                  value={item.name}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
                {action === 'add' && (
                  <>
                    <TextField
                      name="quantity"
                      label="Enter quantity"
                      value={item.quantity}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      name="category"
                      label="Enter category"
                      value={item.category}
                      onChange={handleInputChange}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      name="expiry"
                      label="Enter expiry date"
                      type="date"
                      value={item.expiry}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      margin="normal"
                    />
                  </>
                )}
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button type="submit" variant="contained" color="primary">
                    {action === 'search' ? 'Search' : action === 'add' ? 'Add' : 'Remove'}
                  </Button>
                </Box>
              </form>
            )}
            {searchResult && (
              <Box mt={2}>
                <Typography variant="h6">Search Results:</Typography>
                {typeof searchResult === 'string' ? (
                  <Typography variant="body1">{searchResult}</Typography>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Expiry Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{searchResult.name}</TableCell>
                          <TableCell>{searchResult.quantity}</TableCell>
                          <TableCell>{searchResult.category}</TableCell>
                          <TableCell>{searchResult.expiry}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            {itemsByCategory.length > 0 && (
              <Box mt={2}>
                <Typography variant="h6">Items by Category:</Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Expiry Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {itemsByCategory.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.expiry}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </Container>
        <Box position="fixed" bottom={16} right={16}>
          <Button variant="contained" color="secondary" onClick={handleExpiringItems}>
            Expired Items Section!
          </Button>
          {expiringItems.length > 0 && (
            <Box mt={2} p={2} border={1} borderColor="grey.400" borderRadius={4} bgcolor="white">
              <Typography variant="h6">Expiring Items:</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expiringItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.expiry}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={handleDiscardExpiredItems}
                          >
                            Discard
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Container>
      
    </ThemeProvider>

   

    <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2">
            How to use the Pantry Tracker
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Track your items category wise and you can search, add, remove items. Also mention expiry dates to discard outdated produce.
          </Typography>
        </Box>
      </Modal>
      
   </div>
  );
}

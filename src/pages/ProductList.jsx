import React from 'react';
import { Box, Card, CardMedia, CardContent, Typography, Button, Chip, Stack } from '@mui/material';

const items = [
  {
    id: 1,
    title: "Taiwan Coloring Book - Digital Download",
    price: "$5",
    memberPrice: "$4 for members",
    img: "https://placehold.co/250x140", // Placeholder image
  },
  {
    id: 2,
    title: "Taiwan Coloring Page!",
    price: "$2",
    memberPrice: "$0 for members",
    img: "https://placehold.co/250x140", // Placeholder image
  },
  {
    id: 3,
    title: "FREE Jungle Wallpaper!",
    price: "Free",
    img: "https://placehold.co/250x140", 
  },
  {
    id: 4,
    title: "FREE Jungle Wallpaper!",
    price: "Free",
    img: "https://placehold.co/250x140", 
  },
  {
    id: 5,
    title: "FREE Jungle Wallpaper!",
    price: "Free",
    img: "https://placehold.co/250x140", 
  },
  {
    id: 6,
    title: "FREE Jungle Wallpaper!",
    price: "Free",
    img: "https://placehold.co/250x140", 
  },
  
];

const ProductGallery = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10, 
        p: 3, 
      }}
    >
      {items.map((item) => (
        <Card
          key={item.id}
          sx={{
            width: 250,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%', 
          }}
        >
          {item.stock && item.stock < 6 && (
            <Chip
              label={`Only ${item.stock} left`}
              color="secondary"
              size="small"
              sx={{ position: 'absolute', margin: 1 }}
            />
          )}
          <CardMedia
            component="img"
            height="140"
            image={item.img} 
            alt={item.title}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {item.price}
            </Typography>
            {item.memberPrice && (
              <Typography variant="body2" color="primary">
                {item.memberPrice}
              </Typography>
            )}
          </CardContent>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between">
              <Button variant="contained" size="small">Buy</Button>
              <Button variant="outlined" size="small">Details</Button>
            </Stack>
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export default ProductGallery;

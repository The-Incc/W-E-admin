import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import axiosInstance from 'src/api/axiosInstance';

import AuthContext from 'src/context/AuthContext';
import { useContext } from 'react';

import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';
import { useState } from 'react';
import { Modal } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

// ----------------------------------------------------------------------

export default function PostCard({ post, index }) {
  const { name, createdAt } = post;

  const latestPostLarge = index === 0;

  const latestPost = index === 1 || index === 2;

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedID, setSelectedID] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false)
  }
  const { token } = useContext(AuthContext); // Access login method from AuthContext


  const handleOpenDeleteModal = (id) => {
    setSelectedID(id)
    setOpenDeleteModal(true)
  }

  const handleDeleteBlog = async () => {
    try {
      setOpenDeleteModal(true)
      const response = await axiosInstance.post(`/testimonial/deleteTestimonial/${selectedID}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log(response);
      handleCloseDeleteModal();
      setIsDeleted(true);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }


  const renderTitle = (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Link
        color="inherit"
        variant="subtitle2"
        underline="hover"
        sx={{
          height: 44,
          overflow: 'hidden',
          WebkitLineClamp: 2,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          ...(latestPostLarge && { typography: 'h5', height: 60 }),
          ...((latestPostLarge || latestPost) && {
            color: 'common.white',
          }),
        }}
      >
        {name}
      </Link>
      <IconButton size="small" color="error" onClick={() => handleOpenDeleteModal(post.id)}>
        <Iconify icon="eva:trash-2-outline" />
      </IconButton>
    </Stack>
  );

  const renderInfo = (
    <Stack
      direction="row"
      flexWrap="wrap"
      spacing={1.5}
      justifyContent="flex-end"
      sx={{
        mt: 3,
        color: 'text.disabled',
      }}
    >
      {[
        { number: 0, icon: 'eva:message-circle-fill' },
        { number: 0, icon: 'eva:eye-fill' },
        { number: 0, icon: 'eva:share-fill' },
      ].map((info, _index) => (
        <Stack
          key={_index}
          direction="row"
          sx={{
            ...((latestPostLarge || latestPost) && {
              opacity: 0.48,
              color: 'common.white',
            }),
          }}
        >
          <Iconify width={16} icon={info.icon} sx={{ mr: 0.5 }} />
          <Typography variant="caption">{fShortenNumber(info.number)}</Typography>
        </Stack>
      ))}
    </Stack>
  );

  const renderCover = (
    <Box
      component="img"
      src='https://www.freepik.com/free-photos-vectors/white'
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  const renderDate = (
    <Typography
      variant="caption"
      component="div"
      sx={{
        mb: 2,
        color: 'text.disabled',
        ...((latestPostLarge || latestPost) && {
          opacity: 0.48,
          color: 'common.white',
        }),
      }}
    >
      {fDate(createdAt)}
    </Typography>
  );

  const renderShape = (
    <SvgColor
      color="paper"
      src="/assets/icons/shape-avatar.svg"
      sx={{
        width: 80,
        height: 36,
        zIndex: 9,
        bottom: -15,
        position: 'absolute',
        color: 'background.paper',
        ...((latestPostLarge || latestPost) && { display: 'none' }),
      }}
    />
  );

  if (isDeleted) return null;

  return (
    <>
      <Grid xs={12} sm={latestPostLarge ? 12 : 6} md={latestPostLarge ? 6 : 3}>
        <Card>
          <Box
            sx={{
              position: 'relative',
              pt: 'calc(100% * 3 / 4)',
              ...((latestPostLarge || latestPost) && {
                pt: 'calc(100% * 4 / 3)',
                '&:after': {
                  top: 0,
                  content: "''",
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                },
              }),
              ...(latestPostLarge && {
                pt: {
                  xs: 'calc(100% * 4 / 3)',
                  sm: 'calc(100% * 3 / 4.66)',
                },
              }),
            }}
          >
            {renderShape}

            {/* {renderAvatar} */}

            {renderCover}
          </Box>

          <Box
            sx={{
              p: (theme) => theme.spacing(4, 3, 3, 3),
              ...((latestPostLarge || latestPost) && {
                width: 1,
                bottom: 0,
                position: 'absolute',
              }),
            }}
          >
            {renderDate}

            {renderTitle}

            {renderInfo}
          </Box>
        </Card>
      </Grid>
      <Modal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box borderRadius={3} sx={style}>
          <Stack spacing={2} width={800}></Stack>
          <div>
            <p>Are you sure you want to delete this testimonial?</p>
            <Button
              variant="contained"
              color="error"
              sx={{ width: '150px', alignSelf: 'center' }}
              onClick={handleDeleteBlog}
            >
              Yes
            </Button>
            <Button
              variant="contained"
              color="inherit"
              sx={{ width: '150px', alignSelf: 'center', marginLeft: '20px' }}
              mr={4}
              onClick={handleCloseDeleteModal}
            >
              No
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
}

PostCard.propTypes = {
  post: PropTypes.object.isRequired,
  index: PropTypes.number,
};

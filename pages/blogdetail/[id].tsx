import React from "react";
import { Box, Typography, CardMedia, IconButton } from "@mui/material";
import { Twitter, Facebook, Instagram, Share } from "@mui/icons-material";
import { MainWrapper } from "../../components/styled";

const BlogDetail = () => {
  return (
    <MainWrapper style={{ paddingLeft: 0, paddingRight: 0 }}>
      <Typography variant="h4" sx={{ mb: "24px" }}>
        Sit amet malesuada ipsum lectus tincidunt
      </Typography>
      <Typography
        gutterBottom
        component="span"
        sx={{
          fontSize: 14,
          backgroundColor: "#C676D7",
          px: "11px",
          py: "8px",
        }}
      >
        Published on March 22, 2022
      </Typography>
      <CardMedia
        sx={{ mt: "30px" }}
        component="img"
        src="/images/Rectangle_270.png"
      />
      <Box display="flex" marginTop="40px">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          marginRight="50px"
        >
          <Typography variant="h6" color="#A8A8A8" marginBottom="12px">
            Share
          </Typography>
          <IconButton
            color="primary"
            sx={{ background: "#200C31", mb: "30px" }}
          >
            <Twitter />
          </IconButton>
          <IconButton
            color="primary"
            sx={{ background: "#200C31", mb: "30px" }}
          >
            <Facebook />
          </IconButton>
          <IconButton
            color="primary"
            sx={{ background: "#200C31", mb: "30px" }}
          >
            <Instagram />
          </IconButton>
          <IconButton color="primary" sx={{ background: "#200C31" }}>
            <Share />
          </IconButton>
        </Box>
        <Box>
          <Typography variant="body1">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vitae
            aliquam et bibendum vitae integer suspendisse donec. Massa aliquet
            ut integer quis risus eros, suspendisse. Dignissim in proin
            adipiscing pharetra suscipit proin. Pellentesque ultricies leo elit,
            duis. In scelerisque nunc lobortis in egestas sed luctus. Curabitur
            in proin sit morbi felis. Ut lacinia facilisis at nisi et sociis
            hendrerit. Adipiscing donec tellus id aliquet. Lacus vel semper
            curabitur nec gravida ac ridiculus et eu. Porttitor proin augue
            dictumst senectus malesuada. Cursus quis odio integer nisl faucibus.
            Sem aenean senectus dictum elementum amet etiam mauris vulputate.
            Sem sit nisi adipiscing nunc et eu. Ornare sed viverra neque
            pellentesque elit ipsum eget hendrerit. In rutrum odio urna
            pellentesque sem faucibus auctor. Egestas tincidunt congue fusce vel
            pretium porttitor. Augue pellentesque massa at dignissim leo,
            bibendum suspendisse lectus. Pellentesque proin nec, ante et arcu
            tortor et. Eget tortor feugiat gravida a, neque pretium libero
            senectus amet. Lacus turpis quis augue potenti cursus id mattis
            neque. Pulvinar purus massa mauris at tincidunt consectetur. Augue
            dui purus sagittis sed elit viverra. Pretium ultricies ac vitae eget
            fusce imperdiet sit pulvinar donec. Tempus amet nisl, et nunc quam
            purus nibh. In aliquet nullam ac sed in. Est facilisis bibendum eget
            faucibus phasellus lorem sapien mauris, molestie. Vestibulum amet
            odio adipiscing neque tellus id. Semper odio mauris felis sit augue
            placerat. Pulvinar malesuada interdum vel aliquam interdum pretium.
            Pretium bibendum amet natoque facilisis vitae eu orci. Nunc mauris,
            tristique aliquam ornare. Sapien, aenean diam tempor, urna hac id.
            Lectus turpis mi cras morbi. Aliquet dictumst tincidunt mus nulla
            tortor in faucibus. Nulla nec imperdiet feugiat ac sed nullam sit
            lacus. Bibendum urna adipiscing consequat ullamcorper. Nunc
            tristique rutrum suspendisse platea semper eget orci cursus. Felis
            sed risus odio quis neque orci ultrices donec. Sit massa facilisi
            vestibulum egestas. Tellus tellus, purus aenean proin at penatibus
            lobortis volutpat. Sapien ullamcorper gravida varius id nulla.
            Platea amet, sed proin sodales commodo mauris in felis hendrerit.
            Sagittis, feugiat a venenatis, massa aliquet id sit amet massa.
            Aliquet nibh mauris nunc pellentesque cras ut. Lorem praesent id
            fringilla sit urna nunc lacinia hendrerit lacus. Egestas imperdiet
            eu lectus posuere commodo, arcu duis pellentesque elementum. Odio
            purus sed convallis ipsum. Adipiscing amet, amet tempus mauris ut
            facilisi consectetur purus. Laoreet gravida orci sed aliquam lectus
            massa nisi consequat, dictumst. Orci lorem neque cras interdum vitae
            sed consequat. Nec vivamus ante blandit.
          </Typography>
        </Box>
      </Box>
    </MainWrapper>
  );
};

export default BlogDetail;

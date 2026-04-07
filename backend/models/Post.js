const { DataTypes } = require('sequelize');

function definePostModel(sequelize) {
  return sequelize.define(
    'Post',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false
      },
      imageUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'image_url'
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'published_at'
      }
    },
    {
      tableName: 'posts',
      timestamps: false
    }
  );
}

module.exports = definePostModel;
